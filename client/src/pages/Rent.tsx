import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, DollarSign } from "lucide-react";

export default function Rent() {
  const [filters, setFilters] = useState({
    priceMin: undefined as number | undefined,
    priceMax: undefined as number | undefined,
    location: undefined as string | undefined,
    apartmentType: undefined as string | undefined,
  });

  const { data: properties, isLoading } = trpc.properties.listRent.useQuery(filters);
  const locations = ["Annaba", "Ain Achir", "Seraidi", "Sabri"];
  const apartmentTypes = ["F2", "F3", "F4"];

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-r from-blue-50 to-emerald-50 py-12">
        <div className="container">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Rental Properties</h1>
          <p className="text-xl text-gray-600">Find your perfect rental in Annaba</p>
        </div>
      </section>

      <div className="container py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Filters</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Price Range (DA/month)</label>
                  <input type="number" placeholder="Min" value={filters.priceMin || ""} onChange={(e) => setFilters({...filters, priceMin: e.target.value ? Number(e.target.value) : undefined})} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm" />
                  <input type="number" placeholder="Max" value={filters.priceMax || ""} onChange={(e) => setFilters({...filters, priceMax: e.target.value ? Number(e.target.value) : undefined})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Location</label>
                  <select value={filters.location || ""} onChange={(e) => setFilters({...filters, location: e.target.value || undefined})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">All Locations</option>
                    {locations.map((loc) => (<option key={loc} value={loc}>{loc}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Apartment Type</label>
                  <select value={filters.apartmentType || ""} onChange={(e) => setFilters({...filters, apartmentType: e.target.value || undefined})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">All Types</option>
                    {apartmentTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
                  </select>
                </div>
                <Button onClick={() => setFilters({priceMin: undefined, priceMax: undefined, location: undefined, apartmentType: undefined})} variant="outline" className="w-full">Clear Filters</Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {isLoading ? (<div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>) : properties && properties.length > 0 ? (<div className="grid md:grid-cols-2 gap-6">{properties.map((property) => (<Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow"><div className="bg-gradient-to-br from-blue-100 to-emerald-100 h-48 flex items-center justify-center"><MapPin className="w-12 h-12 text-blue-600" /></div><div className="p-6"><h3 className="text-lg font-bold text-gray-900 mb-2">{property.title}</h3><p className="text-gray-600 text-sm mb-4">{property.description}</p><div className="space-y-3"><div className="flex justify-between text-sm"><span className="text-gray-600">Type</span><span className="font-semibold text-gray-900">{property.type}</span></div><div className="flex justify-between text-sm"><span className="text-gray-600">Location</span><span className="font-semibold text-gray-900">{property.location}</span></div><div className="flex items-center gap-2 text-lg"><DollarSign className="w-5 h-5 text-emerald-600" /><span className="font-bold text-gray-900">{Number(property.price).toLocaleString()} DA/month</span></div></div><Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white">Contact Owner</Button></div></Card>))}</div>) : (<div className="text-center py-12"><p className="text-gray-600 text-lg">No rental properties found</p></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
