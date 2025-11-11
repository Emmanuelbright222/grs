import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MusicBackground from "@/components/MusicBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Events = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

      if (error) throw error;

      const now = new Date();
      const upcoming = (data || []).filter(
        (e) => !e.is_past_event && new Date(e.event_date) >= now
      );
      const past = (data || []).filter(
        (e) => e.is_past_event || new Date(e.event_date) < now
      );

      setUpcomingEvents(upcoming);
      setPastEvents(past);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen relative">
      <MusicBackground />
      <Navbar />
      <main className="pt-20 relative z-10">
        {/* Hero Section */}
        <section className="py-20 bg-navy-black text-white">
          <div className="container mx-auto px-4 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-6 animate-pulse-glow" />
            <h1 className="text-3xl md:text-6xl font-bold mb-6 animate-fade-in">
              Events & Performances
            </h1>
            <p className="text-xl max-w-2xl mx-auto opacity-90 animate-fade-in-up">
              Experience unforgettable live performances from our talented artists
            </p>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center animate-fade-in">
              Upcoming Events
            </h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
              </div>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                No upcoming events scheduled. Check back soon!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingEvents.slice(0, 9).map((event, index) => (
                  <Card
                    key={event.id}
                    className="overflow-hidden border-0 shadow-soft hover:shadow-strong transition-smooth animate-scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative overflow-hidden group">
                      {event.image_url ? (
                        <>
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-full h-48 object-cover transition-spring group-hover:scale-110"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-smooth"></div>
                        </>
                      ) : (
                        <div className="w-full h-48 bg-muted flex items-center justify-center">
                          <Calendar className="w-16 h-16 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-4 py-2 rounded-lg font-bold shadow-glow">
                        {event.event_date ? new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                      {event.artist_name && (
                        <p className="text-accent font-semibold mb-4">{event.artist_name}</p>
                      )}
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="text-sm">{event.location}</span>
                        </div>
                        {event.venue && (
                          <div className="flex items-center text-muted-foreground">
                            <Ticket className="w-4 h-4 mr-2" />
                            <span className="text-sm">{event.venue}</span>
                          </div>
                        )}
                        {event.event_time && (
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span className="text-sm">{event.event_time}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsDetailsOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                        {event.ticket_url ? (
                          <Button variant="hero" className="flex-1" asChild>
                            <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">
                              Get Tickets
                            </a>
                          </Button>
                        ) : (
                          <Button variant="hero" className="flex-1" asChild>
                            <a href="/contact">Book Performance</a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Past Events */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center animate-fade-in">
              Past Events
            </h2>
            <div className="max-w-3xl mx-auto">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
                </div>
              ) : pastEvents.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">
                  No past events yet.
                </p>
              ) : (
                <div className="space-y-6">
                  {pastEvents.map((event, index) => (
                    <Card
                      key={event.id}
                      className="p-6 border-0 shadow-soft hover:shadow-medium transition-smooth animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold mb-1">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {event.event_date ? new Date(event.event_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''} • {event.location}
                          </p>
                        </div>
                        <Calendar className="w-8 h-8 text-accent" />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-in">
              Want to Book Our Artists?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Contact us to discuss performance opportunities and bookings
            </p>
            <Button variant="hero" size="lg" asChild>
              <a href="/contact">Contact Us</a>
            </Button>
          </div>
        </section>
      </main>
      <Footer />

      <Dialog
        open={isDetailsOpen}
        onOpenChange={(open) => {
          setIsDetailsOpen(open);
          if (!open) {
            setSelectedEvent(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title || "Event Details"}</DialogTitle>
            {selectedEvent && (
              <DialogDescription>
                {selectedEvent.event_date
                  ? new Date(selectedEvent.event_date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : null}
                {selectedEvent.event_time ? ` • ${selectedEvent.event_time}` : ""}
              </DialogDescription>
            )}
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-6">
              {selectedEvent.image_url && (
                <img
                  src={selectedEvent.image_url}
                  alt={selectedEvent.title}
                  className="w-full rounded-xl object-cover max-h-64"
                />
              )}

              <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {selectedEvent.event_date
                      ? new Date(selectedEvent.event_date).toLocaleString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Date TBA"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedEvent.location || "Location TBA"}</span>
                </div>
                {selectedEvent.venue && (
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4" />
                    <span>{selectedEvent.venue}</span>
                  </div>
                )}
              </div>

              <div className="text-sm leading-relaxed text-muted-foreground space-y-4">
                {selectedEvent.description && selectedEvent.description.trim() !== "" ? (
                  <div
                    className="space-y-3"
                    dangerouslySetInnerHTML={{ __html: selectedEvent.description }}
                  />
                ) : (
                  <p>No additional details provided.</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {selectedEvent.ticket_url ? (
                  <Button variant="hero" className="flex-1" asChild>
                    <a href={selectedEvent.ticket_url} target="_blank" rel="noopener noreferrer">
                      Get Tickets
                    </a>
                  </Button>
                ) : (
                  <Button variant="hero" className="flex-1" asChild>
                    <a href="/contact">Book Performance</a>
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    setSelectedEvent(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Events;
