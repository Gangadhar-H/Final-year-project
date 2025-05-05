export default function DashboardHome() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Dashboard Overview</h2>
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded shadow">
                    <p className="text-sm text-gray-500">Total Semesters</p>
                    <p className="mt-2 text-3xl font-semibold">6</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <p className="text-sm text-gray-500">Total Subjects</p>
                    <p className="mt-2 text-3xl font-semibold">24</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <p className="text-sm text-gray-500">Total Teachers</p>
                    <p className="mt-2 text-3xl font-semibold">12</p>
                </div>
            </div>
        </div>
    );
}
