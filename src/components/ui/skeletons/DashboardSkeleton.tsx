import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-background">
            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-10">
                {/* Header Skeleton */}
                <header className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-96" />
                </header>

                {/* Bento Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <Skeleton className="h-40 col-span-1 md:col-span-2 rounded-[2rem]" />
                    <Skeleton className="h-40 col-span-1 rounded-[2rem]" />
                    <Skeleton className="h-40 col-span-1 rounded-[2rem]" />

                    <Skeleton className="h-80 col-span-1 md:col-span-2 rounded-[2rem]" />
                    <Skeleton className="h-80 col-span-1 md:col-span-2 rounded-[2rem]" />
                </div>

                {/* Social Feed Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-64 rounded-[2rem]" />
                        <Skeleton className="h-64 rounded-[2rem]" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-96 rounded-[2rem]" />
                    </div>
                </div>
            </main>
        </div>
    )
}
