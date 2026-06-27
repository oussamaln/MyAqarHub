import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function DeveloperDetail() {
  const { id } = useParams<{ id: string }>();
  const developerId = id ? Number(id) : 0;
  const { data: developer, isLoading } = trpc.developers.getById.useQuery({ id: developerId });
  const { data: projects } = trpc.projects.getByDeveloper.useQuery({ developerId });
  const contactMutation = trpc.inquiries.submitDeveloperContact.useMutation();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await contactMutation.mutateAsync({
        developerId,
        ...formData,
      });
      toast.success("Contact form submitted successfully!");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      toast.error("Failed to submit contact form");
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  if (!developer) return <div className="text-center py-12"><p className="text-gray-600">Developer not found</p></div>;

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-r from-blue-50 to-emerald-50 py-12">
        <div className="container">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{developer.name}</h1>
          <p className="text-xl text-gray-600">Promoteur Immobilier</p>
        </div>
      </section>

      <div className="container py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 mb-6">{developer.description}</p>
              <div className="space-y-3">
                {developer.email && <div className="flex items-center gap-2"><Mail className="w-5 h-5 text-blue-600" /><a href={`mailto:${developer.email}`} className="text-blue-600 hover:underline">{developer.email}</a></div>}
                {developer.phone && <div className="flex items-center gap-2"><Phone className="w-5 h-5 text-blue-600" /><span>{developer.phone}</span></div>}
                {developer.address && <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-600" /><span>{developer.address}</span></div>}
              </div>
            </Card>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Projects</h2>
            {projects && projects.length > 0 ? (<div className="grid gap-6">{projects.map((project) => (<Card key={project.id} className="p-6"><h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3><p className="text-gray-600 mb-4">{project.description}</p><div className="flex justify-between text-sm"><span className="text-gray-600">Progress</span><span className="font-semibold text-blue-600">{project.constructionProgress}%</span></div></Card>))}</div>) : (<p className="text-gray-600">No projects available</p>)}
          </div>

          <div>
            <Card className="p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Developer</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Your Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                <input type="email" placeholder="Your Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                <input type="tel" placeholder="Phone (optional)" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                <textarea placeholder="Your Message" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg h-32" required></textarea>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={contactMutation.isPending}>
                  {contactMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
