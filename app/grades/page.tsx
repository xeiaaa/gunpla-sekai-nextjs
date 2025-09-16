import { getAllGrades } from "@/lib/actions/grades";
import { GradeCard } from "@/components/grade-card";

export async function generateMetadata() {
  return {
    title: "Grades - Gunpla Sekai",
    description: "Browse Gunpla kits by grade (HG, RG, MG, PG, etc.)",
  };
}

export default async function GradesPage() {
  const grades = await getAllGrades();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Grades</h1>
          <p className="text-lg opacity-90 max-w-3xl">
            Explore Gunpla kits organized by grade classification system
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {grades.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">No grades found</p>
              <p className="text-muted-foreground text-sm mt-2">
                Check back later for grade content.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">All Grades</h2>
              <p className="text-muted-foreground">
                Browse kits by their grade classification
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {grades.map((grade) => (
                <GradeCard key={grade.id} grade={grade} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
