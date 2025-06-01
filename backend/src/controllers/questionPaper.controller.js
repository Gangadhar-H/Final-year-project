import { asyncHandler } from "../utils/asyncHandler.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import PDFParser from 'pdf2json';
import mammoth from 'mammoth';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to extract text from PDF
const extractTextFromPDF = (filePath) => {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();

        pdfParser.on("pdfParser_dataError", errData => {
            reject(errData.parserError);
        });

        pdfParser.on("pdfParser_dataReady", pdfData => {
            let text = '';
            pdfData.formImage.Pages.forEach(page => {
                page.Texts.forEach(textItem => {
                    text += decodeURIComponent(textItem.R[0].T) + ' ';
                });
            });
            resolve(text);
        });

        pdfParser.loadPDF(filePath);
    });
};

// Helper function to extract text from PowerPoint (converted to text)
const extractTextFromPPT = async (filePath) => {
    // For PowerPoint, you might need to use a service or library
    // This is a placeholder - you'd need to implement actual PPT extraction
    throw new Error("PowerPoint processing requires additional setup");
};

// Helper function to chunk large text
const chunkText = (text, maxChunkSize = 30000) => {
    const chunks = [];
    const sentences = text.split('. ');
    let currentChunk = '';

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxChunkSize) {
            if (currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = sentence;
            } else {
                // If a single sentence is too long, split it
                chunks.push(sentence.slice(0, maxChunkSize));
                currentChunk = sentence.slice(maxChunkSize);
            }
        } else {
            currentChunk += sentence + '. ';
        }
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
};

// Generate questions using Gemini AI
const generateQuestionsWithGemini = async (content, questionConfig) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        Based on the following educational content, generate exactly ${questionConfig.twoMarks} two-mark questions, ${questionConfig.fourMarks} four-mark questions, and ${questionConfig.eightMarks} eight-mark questions.

        Content:
        ${content}

        Please format the output as follows:
        
        ## TWO MARKS QUESTIONS (2 marks each)
        1. [Question]
        2. [Question]
        ...

        ## FOUR MARKS QUESTIONS (4 marks each)
        1. [Question]
        2. [Question]
        ...

        ## EIGHT MARKS QUESTIONS (8 marks each)
        1. [Question]
        2. [Question]
        ...

        Guidelines:
        - Two-mark questions should be short, factual, or definition-based
        - Four-mark questions should require brief explanations or comparisons
        - Eight-mark questions should require detailed explanations, analysis, or problem-solving
        - Questions should cover different topics from the content
        - Avoid repetitive questions
        - Make questions clear and specific
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error('Failed to generate questions with AI');
    }
};

// Main controller function
const generateQuestionPaper = asyncHandler(async (req, res) => {
    try {
        const { twoMarks, fourMarks, eightMarks } = req.body;

        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a file",
                success: false
            });
        }

        const questionConfig = {
            twoMarks: parseInt(twoMarks) || 0,
            fourMarks: parseInt(fourMarks) || 0,
            eightMarks: parseInt(eightMarks) || 0
        };

        if (questionConfig.twoMarks + questionConfig.fourMarks + questionConfig.eightMarks === 0) {
            return res.status(400).json({
                message: "Please specify at least one question",
                success: false
            });
        }

        const filePath = req.file.path;
        const fileExtension = path.extname(req.file.originalname).toLowerCase();

        let extractedText = '';

        // Extract text based on file type
        try {
            switch (fileExtension) {
                case '.pdf':
                    extractedText = await extractTextFromPDF(filePath);
                    break;

                case '.txt':
                    extractedText = fs.readFileSync(filePath, 'utf8');
                    break;

                case '.ppt':
                case '.pptx':
                    // For now, return an error for PowerPoint files
                    return res.status(400).json({
                        message: "PowerPoint files are not supported yet. Please convert to PDF or text format.",
                        success: false
                    });

                default:
                    return res.status(400).json({
                        message: "Unsupported file format",
                        success: false
                    });
            }
        } catch (extractionError) {
            console.error('Text extraction error:', extractionError);
            return res.status(500).json({
                message: "Failed to extract text from file",
                success: false
            });
        }

        // Clean up uploaded file
        fs.unlinkSync(filePath);

        if (!extractedText || extractedText.trim().length === 0) {
            return res.status(400).json({
                message: "No text content found in the uploaded file",
                success: false
            });
        }

        // Check if content is too large and chunk if necessary
        const maxContentSize = 50000; // Adjust based on Gemini limits
        let questions = '';

        if (extractedText.length > maxContentSize) {
            // Process in chunks for very large content
            const chunks = chunkText(extractedText, maxContentSize);
            const questionsPerChunk = {
                twoMarks: Math.ceil(questionConfig.twoMarks / chunks.length),
                fourMarks: Math.ceil(questionConfig.fourMarks / chunks.length),
                eightMarks: Math.ceil(questionConfig.eightMarks / chunks.length)
            };

            const chunkQuestions = [];
            for (const chunk of chunks.slice(0, 3)) { // Limit to first 3 chunks to avoid API limits
                try {
                    const chunkResult = await generateQuestionsWithGemini(chunk, questionsPerChunk);
                    chunkQuestions.push(chunkResult);
                } catch (error) {
                    console.error('Error processing chunk:', error);
                }
            }
            questions = chunkQuestions.join('\n\n');
        } else {
            // Process entire content at once
            questions = await generateQuestionsWithGemini(extractedText, questionConfig);
        }

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `question-paper-${timestamp}`;

        return res.status(200).json({
            message: "Question paper generated successfully",
            success: true,
            data: {
                questions,
                filename,
                questionConfig,
                totalMarks: (questionConfig.twoMarks * 2) + (questionConfig.fourMarks * 4) + (questionConfig.eightMarks * 8)
            }
        });

    } catch (error) {
        console.error('Question generation error:', error);
        return res.status(500).json({
            message: "Failed to generate question paper",
            success: false,
            error: error.message
        });
    }
});

// Download generated question paper as PDF
const downloadQuestionPaperPDF = asyncHandler(async (req, res) => {
    const { questions, filename } = req.body;

    try {
        // You'll need to implement PDF generation here
        // Using libraries like jsPDF or puppeteer

        res.status(200).json({
            message: "PDF generation functionality to be implemented",
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to generate PDF",
            success: false
        });
    }
});

// Download generated question paper as DOCX
const downloadQuestionPaperDOCX = asyncHandler(async (req, res) => {
    const { questions, filename } = req.body;

    try {
        // You'll need to implement DOCX generation here
        // Using libraries like docx or officegen

        res.status(200).json({
            message: "DOCX generation functionality to be implemented",
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to generate DOCX",
            success: false
        });
    }
});

export {
    generateQuestionPaper,
    downloadQuestionPaperPDF,
    downloadQuestionPaperDOCX
};