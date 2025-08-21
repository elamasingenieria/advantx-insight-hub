import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, User, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: string;
  name: string;
  company: string;
  contact_email: string;
  phone?: string;
}

interface ClientSelectorProps {
  selectedClientId?: string;
  onClientSelect: (clientId: string) => void;
  onError?: (error: string) => void;
}

export function ClientSelector({ selectedClientId, onClientSelect, onError }: ClientSelectorProps) {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // New client form state
  const [newClient, setNewClient] = useState({
    name: '',
    company: '',
    contact_email: '',
    phone: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data: clientsData, error } = await supabase
        .from('clients')
        .select('*')
        .order('company', { ascending: true });

      if (error) throw error;
      setClients(clientsData || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      const errorMessage = 'Failed to load clients';
      onError?.(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createClient = async () => {
    // Validate required fields
    if (!newClient.name.trim() || !newClient.company.trim() || !newClient.contact_email.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Company, Email).",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newClient.contact_email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      
      // Get current user profile for linking clients
      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profileError) throw profileError;

      const clientData = {
        name: newClient.name.trim(),
        company: newClient.company.trim(),
        contact_email: newClient.contact_email.trim().toLowerCase(),
        phone: newClient.phone.trim() || null,
        profile_id: currentProfile.id
      };

      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (error) throw error;

      // Add the new client to the list
      setClients(prev => [...prev, data].sort((a, b) => a.company.localeCompare(b.company)));
      
      // Select the new client
      onClientSelect(data.id);
      
      // Reset form and close modal
      setNewClient({ name: '', company: '', contact_email: '', phone: '' });
      setIsModalOpen(false);

      toast({
        title: "Success",
        description: `Client "${data.name}" has been created successfully.`,
      });
      
    } catch (error: any) {
      console.error('Error creating client:', error);
      let errorMessage = 'Failed to create client';
      
      // Handle specific error cases
      if (error.code === '23505') {
        errorMessage = 'A client with this email already exists';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      onError?.(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleInputChange = (field: keyof typeof newClient, value: string) => {
    setNewClient(prev => ({ ...prev, [field]: value }));
  };

  const selectedClient = clients.find(client => client.id === selectedClientId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Client Information
        </CardTitle>
        <CardDescription>
          Select an existing client or create a new one
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="client-select">Select Client *</Label>
          <Select
            value={selectedClientId || ''}
            onValueChange={onClientSelect}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder={loading ? "Loading clients..." : "Choose a client..."} />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{client.company}</div>
                      <div className="text-sm text-muted-foreground">{client.name}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedClient && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Selected Client:</div>
            <div className="font-medium">{selectedClient.company}</div>
            <div className="text-sm text-muted-foreground">
              {selectedClient.name} • {selectedClient.contact_email}
              {selectedClient.phone && ` • ${selectedClient.phone}`}
            </div>
          </div>
        )}

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Client</DialogTitle>
              <DialogDescription>
                Add a new client to the system. All fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-client-name">Client Name *</Label>
                  <Input
                    id="new-client-name"
                    value={newClient.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="John Doe"
                    disabled={creating}
                  />
                </div>
                <div>
                  <Label htmlFor="new-client-company">Company *</Label>
                  <Input
                    id="new-client-company"
                    value={newClient.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="ACME Corp"
                    disabled={creating}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="new-client-email">Contact Email *</Label>
                <Input
                  id="new-client-email"
                  type="email"
                  value={newClient.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="john@acme.com"
                  disabled={creating}
                />
              </div>
              
              <div>
                <Label htmlFor="new-client-phone">Phone</Label>
                <Input
                  id="new-client-phone"
                  value={newClient.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  disabled={creating}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={createClient}
                disabled={creating}
              >
                {creating ? "Creating..." : "Create Client"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}