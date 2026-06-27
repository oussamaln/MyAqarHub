import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Edit2, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface ProjectForm {
  name: string;
  description: string;
  location: string;
  latitude: string;
  longitude: string;
  constructionProgress: string;
  pricePerM2: string;
  totalArea: string;
  expectedDeliveryDate: string;
  developerId: string;
  images: string[];
}

export default function AdminDashboard() {
  const { isAuthenticated, user, loading } = useAuth();
  const { data: projects, isLoading: projectsLoading, refetch: refetchProjects } = trpc.projects.list.useQuery();
  const { data: developers } = trpc.developers.list.useQuery();
  const createProjectMutation = trpc.projects.create.useMutation();
  const updateProjectMutation = trpc.projects.update.useMutation();
  const deleteProjectMutation = trpc.projects.delete.useMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState<ProjectForm>({
    name: "",
    description: "",
    location: "",
    latitude: "",
    longitude: "",
    constructionProgress: "0",
    pricePerM2: "",
    totalArea: "",
    expectedDeliveryDate: "",
    developerId: "",
    images: [],
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only administrators can access this page.</p>
        </div>
      </div>
    );
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a data URL for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
      setFormData({
        ...formData,
        images: [...formData.images, dataUrl],
      });
      toast.success("Image added");
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.location || !formData.developerId) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingId) {
        await updateProjectMutation.mutateAsync({
          id: editingId,
          ...formData,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          constructionProgress: parseInt(formData.constructionProgress),
          pricePerM2: parseFloat(formData.pricePerM2),
          totalArea: formData.totalArea ? parseFloat(formData.totalArea) : undefined,
          developerId: parseInt(formData.developerId),
        });
        toast.success("Project updated successfully");
      } else {
        await createProjectMutation.mutateAsync({
          ...formData,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          constructionProgress: parseInt(formData.constructionProgress),
          pricePerM2: parseFloat(formData.pricePerM2),
          totalArea: formData.totalArea ? parseFloat(formData.totalArea) : undefined,
          developerId: parseInt(formData.developerId),
        });
        toast.success("Project created successfully");
      }

      setFormData({
        name: "",
        description: "",
        location: "",
        latitude: "",
        longitude: "",
        constructionProgress: "0",
        pricePerM2: "",
        totalArea: "",
        expectedDeliveryDate: "",
        developerId: "",
        images: [],
      });
      setEditingId(null);
      setShowForm(false);
      refetchProjects();
    } catch (error) {
      toast.error("Failed to save project");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await deleteProjectMutation.mutateAsync({ id });
      toast.success("Project deleted successfully");
      refetchProjects();
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  const handleEdit = (project: any) => {
    setFormData({
      name: project.name,
      description: project.description || "",
      location: project.location,
      latitude: project.latitude.toString(),
      longitude: project.longitude.toString(),
      constructionProgress: project.constructionProgress.toString(),
      pricePerM2: project.pricePerM2.toString(),
      totalArea: project.totalArea?.toString() || "",
      expectedDeliveryDate: project.expectedDeliveryDate || "",
      developerId: project.developerId.toString(),
      images: project.images || [],
    });
    setEditingId(project.id);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-r from-blue-50 to-emerald-50 py-12">
        <div className="container">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage projects, properties, and developers</p>
        </div>
      </section>

      <div className="container py-12">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              if (showForm) {
                setFormData({
                  name: "",
                  description: "",
                  location: "",
                  latitude: "",
                  longitude: "",
                  constructionProgress: "0",
                  pricePerM2: "",
                  totalArea: "",
                  expectedDeliveryDate: "",
                  developerId: "",
                  images: [],
                });
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? "Cancel" : "Add Project"}
          </Button>
        </div>

        {showForm && (
          <Card className="p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {editingId ? "Edit Project" : "Create New Project"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Project Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                {/* Developer */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Developer *
                  </label>
                  <select
                    value={formData.developerId}
                    onChange={(e) => setFormData({ ...formData, developerId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Select a developer</option>
                    {developers?.map((dev) => (
                      <option key={dev.id} value={dev.id}>
                        {dev.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Location *
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Select location</option>
                    <option value="Annaba">Annaba</option>
                    <option value="Ain Achir">Ain Achir</option>
                    <option value="Seraidi">Seraidi</option>
                    <option value="Sabri">Sabri</option>
                  </select>
                </div>

                {/* Construction Progress */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Construction Progress (%) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.constructionProgress}
                    onChange={(e) =>
                      setFormData({ ...formData, constructionProgress: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                {/* Price per m² */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Price per m² (DA) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pricePerM2}
                    onChange={(e) => setFormData({ ...formData, pricePerM2: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                {/* Total Area */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Total Area (m²)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.totalArea}
                    onChange={(e) => setFormData({ ...formData, totalArea: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Latitude */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                {/* Longitude */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                {/* Expected Delivery Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    value={formData.expectedDeliveryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expectedDeliveryDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
                  placeholder="Project description..."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Project Images
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-semibold">
                      Click to upload
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-gray-500 text-sm mt-2">PNG, JPG, GIF up to 10MB</p>
                </div>

                {/* Image Previews */}
                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={img}
                          alt={`Preview ${idx}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
                >
                  {createProjectMutation.isPending || updateProjectMutation.isPending
                    ? "Saving..."
                    : editingId
                    ? "Update Project"
                    : "Create Project"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      name: "",
                      description: "",
                      location: "",
                      latitude: "",
                      longitude: "",
                      constructionProgress: "0",
                      pricePerM2: "",
                      totalArea: "",
                      expectedDeliveryDate: "",
                      developerId: "",
                      images: [],
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Projects List */}
        {projectsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                    <p className="text-gray-600">{project.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(project)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(project.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Progress</p>
                    <p className="font-semibold text-gray-900">{project.constructionProgress}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price/m²</p>
                    <p className="font-semibold text-gray-900">
                      {Number(project.pricePerM2).toLocaleString()} DA
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Area</p>
                    <p className="font-semibold text-gray-900">
                      {project.totalArea ? `${Number(project.totalArea).toLocaleString()} m²` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Images</p>
                    <p className="font-semibold text-gray-900">{project.images?.length || 0}</p>
                  </div>
                </div>

                {project.images && project.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {project.images.slice(0, 4).map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Project ${idx}`}
                        className="w-full h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No projects yet. Create your first project!</p>
          </div>
        )}
      </div>
    </div>
  );
}
