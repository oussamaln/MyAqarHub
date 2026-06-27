import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Building2 } from "lucide-react";
import { Link } from "wouter";

export default function Developers() {
  const { data: developers, isLoading } = trpc.developers.list.useQuery();

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-r from-blue-50 to-emerald-50 py-12">
        <div className="container">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Promoteurs Immobiliers</h1>
          <p className="text-xl text-gray-600">Connect with leading real estate developers in Annaba</p>
        </div>
      </section>

      <div className="container py-12">
        {isLoading ? (<div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>) : developers && developers.length > 0 ? (<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{developers.map((developer) => (<Card key={developer.id} className="overflow-hidden hover:shadow-lg transition-shadow"><div className="bg-gradient-to-br from-blue-100 to-emerald-100 h-40 flex items-center justify-center"><Building2 className="w-12 h-12 text-blue-600" /></div><div className="p-6"><h3 className="text-xl font-bold text-gray-900 mb-2">{developer.name}</h3><p className="text-gray-600 text-sm mb-4">{developer.description}</p><div className="space-y-2 mb-4"><p className="text-sm text-gray-600"><strong>Email:</strong> {developer.email}</p>{developer.phone && <p className="text-sm text-gray-600"><strong>Phone:</strong> {developer.phone}</p>}</div><Link href={`/developers/${developer.id}`}><Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">View Projects</Button></Link></div></Card>))}</div>) : (<div className="text-center py-12"><p className="text-gray-600 text-lg">No developers found</p></div>)}
      </div>
    </div>
  );
}
