import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Calendar, DollarSign, Heart } from "lucide-react";
import { MapView } from "@/components/Map";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

interface ProjectLocation {
  name: string;
  lat: number;
  lng: number;
}

const LOCATIONS: Record<string, ProjectLocation> = {
  "Annaba": { name: "Annaba", lat: 36.9028, lng: 7.7692 },
  "Ain Achir": { name: "Ain Achir", lat: 36.7800, lng: 7.6500 },
  "Seraidi": { name: "Seraidi", lat: 36.8500, lng: 7.8000 },
  "Sabri": { name: "Sabri", lat: 36.9200, lng: 7.7400 },
};

export default function Projects() {
  const { isAuthenticated } = useAuth();
  const { data: projects, isLoading } = trpc.projects.list.useQuery();
  const { data: favorites } = trpc.favorites.list.useQuery(undefined, { enabled: isAuthenticated });
  const addFavoriteMutation = trpc.favorites.add.useMutation();
  const removeFavoriteMutation = trpc.favorites.remove.useMutation();

  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  const isFavorite = (projectId: number) => {
    return favorites?.some(fav => fav.id === projectId) || false;
  };

  const handleToggleFavorite = async (projectId: number) => {
    if (!isAuthenticated) {
      toast.error("Please log in to save favorites");
      return;
    }

    try {
      if (isFavorite(projectId)) {
        await removeFavoriteMutation.mutateAsync({ projectId });
        toast.success("Removed from favorites");
      } else {
        await addFavoriteMutation.mutateAsync({ projectId });
        toast.success("Added to favorites");
      }
    } catch (error) {
      toast.error("Failed to update favorite");
    }
  };

  const handleMapReady = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    setMapReady(true);

    if (projects && projects.length > 0) {
      // Add markers for each project
      const newMarkers: google.maps.Marker[] = [];
      const bounds = new google.maps.LatLngBounds();

      projects.forEach((project) => {
        const marker = new google.maps.Marker({
          position: {
            lat: Number(project.latitude),
            lng: Number(project.longitude),
          },
          map: mapInstance,
          title: project.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#2563eb",
            fillOpacity: 0.8,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });

        marker.addListener("click", () => {
          setSelectedProject(project);
        });

        newMarkers.push(marker);
        bounds.extend(marker.getPosition()!);
      });

      setMarkers(newMarkers);
      mapInstance.fitBounds(bounds);
    }
  }, [projects]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-50 to-emerald-50 py-12">
        <div className="container">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Real Estate Projects</h1>
          <p className="text-xl text-gray-600">Explore ongoing and planned developments across Annaba region</p>
        </div>
      </section>

      <div className="container py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden h-[600px]">
              <MapView initialCenter={{ lat: 36.9028, lng: 7.7692 }} initialZoom={10} onMapReady={handleMapReady} />
            </div>
          </div>

          {/* Projects List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Projects</h2>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedProject?.id === project.id
                        ? "border-blue-500 bg-blue-50"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900 flex-1">{project.name}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(project.id);
                        }}
                        className="ml-2"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            isFavorite(project.id)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-400 hover:text-red-500"
                          }`}
                        />
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {project.location}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-blue-600">{project.constructionProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${project.constructionProgress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 pt-2">
                        <DollarSign className="w-4 h-4" />
                        {Number(project.pricePerM2).toLocaleString()} DA/m²
                      </div>
                      {project.expectedDeliveryDate && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(project.expectedDeliveryDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No projects available</p>
            )}
          </div>
        </div>

        {/* Selected Project Details */}
        {selectedProject && (
          <div className="mt-12 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-lg p-8 border border-gray-100">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-3xl font-bold text-gray-900">{selectedProject.name}</h2>
                  <button
                    onClick={() => handleToggleFavorite(selectedProject.id)}
                    className="ml-2"
                  >
                    <Heart
                      className={`w-6 h-6 ${
                        isFavorite(selectedProject.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400 hover:text-red-500"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-gray-600 mb-6">{selectedProject.description}</p>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-gray-600 text-sm">Construction Progress</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedProject.constructionProgress}%</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-gray-600 text-sm">Price per m²</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Number(selectedProject.pricePerM2).toLocaleString()} DA
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-gray-600 text-sm">Expected Delivery</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProject.expectedDeliveryDate
                        ? new Date(selectedProject.expectedDeliveryDate).toLocaleDateString()
                        : "TBD"}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-white rounded-lg p-6 border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Project Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600 text-sm">Location</p>
                      <p className="font-semibold text-gray-900">{selectedProject.location}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Total Area</p>
                      <p className="font-semibold text-gray-900">
                        {selectedProject.totalArea ? `${Number(selectedProject.totalArea).toLocaleString()} m²` : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Status</p>
                      <p className="font-semibold text-gray-900 capitalize">{selectedProject.status.replace("_", " ")}</p>
                    </div>
                    <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white">
                      Request Information
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
