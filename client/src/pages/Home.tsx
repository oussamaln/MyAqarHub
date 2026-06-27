import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, MapPin, TrendingUp, Users } from "lucide-react";

export default function Home() {
  const { data: featuredProjects, isLoading, error } = trpc.projects.featured.useQuery({ limit: 6 });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-20 md:py-32">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Find Your Perfect Property in <span className="text-blue-600">Annaba</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Discover new real estate developments, track construction progress, and invest in the future of Annaba.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/projects">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                    Explore Projects
                  </Button>
                </Link>
                <Link href="/buy">
                  <Button variant="outline" className="px-8 py-3 text-lg">
                    Browse Properties
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-gradient-to-br from-blue-200 to-emerald-200 rounded-2xl h-96 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-24 h-24 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-700 font-semibold">Annaba Real Estate Hub</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">5+</div>
              <p className="text-gray-600">Active Projects</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">4</div>
              <p className="text-gray-600">Locations</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
              <p className="text-gray-600">Properties</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Projects</h2>
            <p className="text-gray-600 text-lg">Discover the latest real estate developments in Annaba</p>
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 font-semibold mb-2">Unable to load featured projects</p>
              <p className="text-red-500 text-sm">Please try again later</p>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : featuredProjects && featuredProjects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project) => (
                <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="bg-gradient-to-br from-blue-100 to-emerald-100 h-48 flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-blue-600" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Construction Progress</span>
                        <span className="font-semibold text-blue-600">{project.constructionProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full"
                          style={{ width: `${project.constructionProgress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm pt-2">
                        <span className="text-gray-600">Price per m²</span>
                        <span className="font-semibold text-gray-900">
                          {Number(project.pricePerM2).toLocaleString()} DA
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Location</span>
                        <span className="font-semibold text-gray-900">{project.location}</span>
                      </div>
                    </div>
                    <Link href="/projects">
                      <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No projects available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">Why Choose MyAqarHub?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <TrendingUp className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Track Progress</h3>
              <p className="text-gray-600">Monitor construction progress and price evolution in real-time</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <MapPin className="w-12 h-12 text-emerald-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Explore Locations</h3>
              <p className="text-gray-600">Browse properties across Annaba, Ain Achir, Seraidi, and Sabri</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <Users className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Connect Directly</h3>
              <p className="text-gray-600">Get in touch with developers and submit investment inquiries</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-emerald-600">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Invest?</h2>
          <p className="text-xl text-blue-100 mb-8">Create an account to save favorites and track your investments</p>
          <Link href="/dashboard">
            <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
              Get Started
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
