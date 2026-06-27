import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Heart } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { isAuthenticated, loading } = useAuth();
  const { data: favorites, isLoading } = trpc.favorites.list.useQuery(undefined, { enabled: isAuthenticated });
  const removeFavoriteMutation = trpc.favorites.remove.useMutation();

  if (loading || isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  if (!isAuthenticated) return <div className="text-center py-12"><p className="text-gray-600">Please log in to access the dashboard</p></div>;

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-r from-blue-50 to-emerald-50 py-12">
        <div className="container">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Investor Dashboard</h1>
          <p className="text-xl text-gray-600">Manage your favorite projects and track investments</p>
        </div>
      </section>

      <div className="container py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Projects</h2>
        {favorites && favorites.length > 0 ? (<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{favorites.map((project) => (<Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow"><div className="bg-gradient-to-br from-blue-100 to-emerald-100 h-40 flex items-center justify-center"><Heart className="w-12 h-12 text-red-500" /></div><div className="p-6"><h3 className="text-lg font-bold text-gray-900 mb-2">{project.name}</h3><p className="text-gray-600 text-sm mb-4">{project.location}</p><div className="space-y-2 mb-4"><div className="flex justify-between text-sm"><span className="text-gray-600">Progress</span><span className="font-semibold text-blue-600">{project.constructionProgress}%</span></div><div className="flex justify-between text-sm"><span className="text-gray-600">Price/m²</span><span className="font-semibold text-gray-900">{Number(project.pricePerM2).toLocaleString()} DA</span></div></div><Button onClick={() => removeFavoriteMutation.mutate({projectId: project.id})} variant="outline" className="w-full text-red-600 hover:text-red-700">Remove</Button></div></Card>))}</div>) : (<div className="text-center py-12"><p className="text-gray-600 text-lg">No saved projects yet</p><Link href="/projects"><Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">Explore Projects</Button></Link></div>)}
      </div>
    </div>
  );
}
