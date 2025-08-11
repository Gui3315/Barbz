import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

export default function MeuEstabelecimento() {
  const [fatalError, setFatalError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [barbers, setBarbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBarberName, setNewBarberName] = useState("");
  const [newBarberPhone, setNewBarberPhone] = useState("");
  const [newBarberActive, setNewBarberActive] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editBarber, setEditBarber] = useState<{name: string; phone: string; is_active: boolean} | null>(null);

  // Serviços
  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [barbershopId, setBarbershopId] = useState<string | null>(null);
  // Formulário de novo serviço
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    price: "",
    duration_minutes: ""
  });
  const [addingService, setAddingService] = useState(false);
  // Edição de serviço
  const [editServiceId, setEditServiceId] = useState<string | null>(null);
  const [editService, setEditService] = useState<any>(null);
  const [savingService, setSavingService] = useState(false);

  // Handler para adicionar serviço
  const handleAddService = async () => {
    if (!barbershopId) return;
    if (!newService.name || !newService.price || !newService.duration_minutes) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    setAddingService(true);
    const { error } = await supabase.from("services").insert({
      name: newService.name,
      description: newService.description,
      price: Number(newService.price),
      duration_minutes: Number(newService.duration_minutes),
      barbershop_id: barbershopId,
      user_id: user?.id
    });
    if (!error) {
      toast({ title: "Serviço cadastrado!" });
      setNewService({ name: "", description: "", price: "", duration_minutes: "" });
      // Atualiza lista
      setLoadingServices(true);
      const { data: servicesData } = await supabase
        .from("services")
        .select("id, name, description, price, duration_minutes, created_at")
        .eq("barbershop_id", barbershopId)
        .order("created_at", { ascending: true });
      setServices(servicesData || []);
      setLoadingServices(false);
    } else {
      toast({ title: "Erro ao cadastrar serviço", description: error.message, variant: "destructive" });
    }
    setAddingService(false);
  };

  // Handler para editar serviço
  const handleEditService = (service: any) => {
    setEditServiceId(service.id);
    setEditService({
      name: service.name,
      description: service.description || "",
      price: service.price,
      duration_minutes: service.duration_minutes
    });
  };

  // Handler para salvar edição de serviço
  const handleSaveEditService = async (serviceId: string) => {
    if (!editService) return;
    setSavingService(true);
    const { error } = await supabase.from("services").update({
      name: editService.name,
      description: editService.description,
      price: Number(editService.price),
      duration_minutes: Number(editService.duration_minutes)
    }).eq("id", serviceId);
    if (!error) {
      toast({ title: "Serviço atualizado!" });
      setEditServiceId(null);
      setEditService(null);
      setLoadingServices(true);
      const { data: servicesData } = await supabase
        .from("services")
        .select("id, name, description, price, duration_minutes, created_at")
        .eq("barbershop_id", barbershopId)
        .order("created_at", { ascending: true });
      setServices(servicesData || []);
      setLoadingServices(false);
    } else {
      toast({ title: "Erro ao atualizar serviço", description: error.message, variant: "destructive" });
    }
    setSavingService(false);
  };

  // Handler para remover serviço
  const handleRemoveService = async (serviceId: string) => {
    if (!window.confirm("Tem certeza que deseja remover este serviço?")) return;
    const { error } = await supabase.from("services").delete().eq("id", serviceId);
    if (!error) {
      toast({ title: "Serviço removido!" });
      setEditServiceId(null);
      setEditService(null);
      setLoadingServices(true);
      const { data: servicesData } = await supabase
        .from("services")
        .select("id, name, description, price, duration_minutes, created_at")
        .eq("barbershop_id", barbershopId)
        .order("created_at", { ascending: true });
      setServices(servicesData || []);
      setLoadingServices(false);
    } else {
      toast({ title: "Erro ao remover serviço", description: error.message, variant: "destructive" });
    }
  };

  // Fetch barbers and services
  useEffect(() => {
    const fetchBarbersAndServices = async () => {
      setLoading(true);
      setLoadingServices(true);
      // Get the owner's barbershop_id
      const { data: shop, error: shopErr } = await supabase
        .from("barbershops")
        .select("id")
        .eq("owner_id", user?.id)
        .maybeSingle();
      if (!shop || shopErr) {
        setBarbers([]);
        setServices([]);
        setLoading(false);
        setLoadingServices(false);
        setBarbershopId(null);
        return;
      }
      setBarbershopId(shop.id);
      // Fetch barbers
      const { data: barbersData } = await supabase
        .from("barbers")
        .select("id, name, phone, is_active, created_at")
        .eq("barbershop_id", shop.id)
        .order("created_at", { ascending: true });
      setBarbers(barbersData || []);
      setLoading(false);
      // Fetch services
      const { data: servicesData } = await supabase
        .from("services")
        .select("id, name, description, price, duration_minutes, created_at")
        .eq("barbershop_id", shop.id)
        .order("created_at", { ascending: true });
      setServices(servicesData || []);
      setLoadingServices(false);
    };
    if (user?.id) fetchBarbersAndServices();
  }, [user]);

  // Add new barber
  const handleAddBarber = async () => {
    if (!newBarberName) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    // Get barbershop_id
    const { data: shop } = await supabase
      .from("barbershops")
      .select("id")
      .eq("owner_id", user?.id)
      .maybeSingle();
    if (!shop) return;
    const { error } = await supabase.from("barbers").insert({
      name: newBarberName,
      phone: newBarberPhone,
      user_id: user?.id,
      barbershop_id: shop.id,
      is_active: newBarberActive,
    });
    if (!error) {
      setNewBarberName("");
      setNewBarberPhone("");
      setNewBarberActive(true);
      toast({ title: "Barbeiro cadastrado!" });
      // Refresh list
      const { data } = await supabase
        .from("barbers")
        .select("id, name, phone, is_active, created_at")
        .eq("barbershop_id", shop.id)
        .order("created_at", { ascending: true });
      setBarbers(data || []);
    } else {
      toast({ title: "Erro ao cadastrar barbeiro", description: error.message, variant: "destructive" });
    }
  };

  // Edit barber
  const handleEditBarber = (barber: any) => {
    setEditId(barber.id);
    setEditBarber({
      name: barber.name,
      phone: barber.phone || "",
      is_active: barber.is_active,
    });
  };

  const handleSaveEdit = async (barberId: string) => {
    if (!editBarber) return;
    const { error } = await supabase.from("barbers").update({
      name: editBarber.name,
      phone: editBarber.phone,
      is_active: editBarber.is_active,
    }).eq("id", barberId);
    if (!error) {
      toast({ title: "Barbeiro atualizado!" });
      setEditId(null);
      setEditBarber(null);
      // Refresh list
      const { data: shop } = await supabase
        .from("barbershops")
        .select("id")
        .eq("owner_id", user?.id)
        .maybeSingle();
      if (shop) {
        const { data } = await supabase
          .from("barbers")
          .select("id, name, phone, is_active, created_at")
          .eq("barbershop_id", shop.id)
          .order("created_at", { ascending: true });
        setBarbers(data || []);
      }
    } else {
      toast({ title: "Erro ao atualizar barbeiro", description: error.message, variant: "destructive" });
    }
  };

  // Remove barber
  const handleRemoveBarber = async (barberId: string) => {
    if (!window.confirm("Tem certeza que deseja remover este barbeiro?")) return;
    const { error } = await supabase.from("barbers").delete().eq("id", barberId);
    if (!error) {
      toast({ title: "Barbeiro removido!" });
      setEditId(null);
      setEditBarber(null);
      // Refresh list
      const { data: shop } = await supabase
        .from("barbershops")
        .select("id")
        .eq("owner_id", user?.id)
        .maybeSingle();
      if (shop) {
        const { data } = await supabase
          .from("barbers")
          .select("id, name, phone, is_active, created_at")
          .eq("barbershop_id", shop.id)
          .order("created_at", { ascending: true });
        setBarbers(data || []);
      }
    } else {
      toast({ title: "Erro ao remover barbeiro", description: error.message, variant: "destructive" });
    }
  };

    // Horários e dias de funcionamento
  const weekDays = [
    { key: 'Segunda', label: 'Segunda' },
    { key: 'Terça', label: 'Terça' },
    { key: 'Quarta', label: 'Quarta' },
    { key: 'Quinta', label: 'Quinta' },
    { key: 'Sexta', label: 'Sexta' },
    { key: 'Sábado', label: 'Sábado' },
    { key: 'Domingo', label: 'Domingo' },
  ];
  const [schedule, setSchedule] = useState<any>({});
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Buscar horários ao carregar barbershopId
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!barbershopId) return;
      setLoadingSchedule(true);
      const { data } = await supabase
        .from('salon_schedule')
        .select('id, day, open, close, active')
        .eq('barbershop_id', barbershopId);
      const sched: any = {};
      data?.forEach((row: any) => {
        sched[row.day] = {
          id: row.id,
          is_open: row.active,
          open: row.open || '',
          close: row.close || ''
        };
      });
      setSchedule(sched);
      setLoadingSchedule(false);
    };
    if (barbershopId) fetchSchedule();
  }, [barbershopId]);

  // Handler para alterar checkbox ou horários
  const handleScheduleChange = (day: string, field: 'is_open' | 'open' | 'close', value: any) => {
    setSchedule((prev: any) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  // Salvar horários
  const handleSaveSchedule = async () => {
    if (!barbershopId) return;
    setSavingSchedule(true);
    for (const day of weekDays) {
      const s = schedule[day.key] || {};
      if (s.id) {
        // update
        await supabase.from('salon_schedule').update({
          active: !!s.is_open,
          open: s.open || null,
          close: s.close || null
        }).eq('id', s.id);
      } else {
        // insert
        await supabase.from('salon_schedule').insert({
          barbershop_id: barbershopId,
          day: day.key,
          active: !!s.is_open,
          open: s.open || null,
          close: s.close || null
        });
      }
    }
    toast({ title: 'Horários salvos!' });
    setSavingSchedule(false);
  };

  try {
    if (fatalError) {
      return (
        <DashboardLayout>
          <div className="p-8 text-red-600 font-bold">Erro: {fatalError}</div>
        </DashboardLayout>
      );
    }
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="header-text">Meu Estabelecimento</h1>
          <Card>
          <CardHeader>
            <CardTitle>Barbeiros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-2 items-center">
              <Input
                placeholder="Nome do barbeiro"
                value={newBarberName}
                onChange={e => setNewBarberName(e.target.value)}
                className="w-50"
              />
              <Input
                placeholder="Telefone (opcional)"
                value={newBarberPhone}
                onChange={e => setNewBarberPhone(e.target.value)}
                className="w-50"
              />
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={newBarberActive}
                  onChange={e => setNewBarberActive(e.target.checked)}
                />
                Ativo
              </label>
              <Button onClick={handleAddBarber}>Adicionar</Button>
            </div>
            {loading ? (
              <div>Carregando barbeiros...</div>
            ) : barbers.length === 0 ? (
              <div>Nenhum barbeiro cadastrado.</div>
            ) : (
              <ul className="divide-y">
                {barbers.map(barber => (
                  <li key={barber.id} className="py-2 flex items-center justify-between gap-2">
                    {editId === barber.id ? (
                      <>
                        <div className="flex flex-col sm:flex-row gap-2 flex-1">
                          <Input
                            value={editBarber?.name || ""}
                            onChange={e => setEditBarber(editBarber => ({...editBarber!, name: e.target.value}))}
                            placeholder="Nome"
                          />
                          <Input
                            value={editBarber?.phone || ""}
                            onChange={e => setEditBarber(editBarber => ({...editBarber!, phone: e.target.value}))}
                            placeholder="Telefone"
                          />
                          <label className="flex items-center gap-1 text-sm">
                            <input
                              type="checkbox"
                              checked={!!editBarber?.is_active}
                              onChange={e => setEditBarber(editBarber => ({...editBarber!, is_active: e.target.checked}))}
                            />
                            Ativo
                          </label>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => handleSaveEdit(barber.id)}>Salvar</Button>
                          <Button size="sm" variant="outline" onClick={() => {setEditId(null); setEditBarber(null);}}>Cancelar</Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span>{barber.name} {barber.phone && <span className="text-muted-foreground ml-2">({barber.phone})</span>}</span>
                        <div className="flex gap-2 items-center">
                          <span
                            className={
                              `px-2 py-0.5 rounded-full text-xs font-semibold ` +
                              (barber.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300')
                            }
                          >
                            {barber.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                          <Button size="sm" variant="outline" onClick={() => handleEditBarber(barber)}>Editar</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleRemoveBarber(barber.id)}>Remover</Button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        {/* Horários e Dias de Funcionamento */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Horários e Dias de Funcionamento</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSchedule ? (
              <div>Carregando horários...</div>
            ) : (
              <form className="space-y-2">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-1 px-2 font-semibold">Dia</th>
                      <th className="py-1 px-2 font-semibold">Atende?</th>
                      <th className="py-1 px-2 font-semibold">Abertura</th>
                      <th className="py-1 px-2 font-semibold">Fechamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weekDays.map(day => (
                      <tr key={day.key} className="border-t">
                        <td className="py-2 px-2 whitespace-nowrap">{day.label}</td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="checkbox"
                            checked={!!schedule[day.key]?.is_open}
                            onChange={e => handleScheduleChange(day.key, 'is_open', e.target.checked)}
                          />
                        </td>
                        <td className="py-2 px-2">
                          <Input
                            type="time"
                            value={schedule[day.key]?.open || ''}
                            onChange={e => handleScheduleChange(day.key, 'open', e.target.value)}
                            disabled={!schedule[day.key]?.is_open}
                          />
                        </td>
                        <td className="py-2 px-2">
                          <Input
                            type="time"
                            value={schedule[day.key]?.close || ''}
                            onChange={e => handleScheduleChange(day.key, 'close', e.target.value)}
                            disabled={!schedule[day.key]?.is_open}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pt-4">
                  <Button onClick={e => { e.preventDefault(); handleSaveSchedule(); }} disabled={savingSchedule}>
                    Salvar Horários
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Serviços */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Formulário de novo serviço */}
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <Input
                placeholder="Nome do serviço"
                value={newService.name}
                onChange={e => setNewService(s => ({ ...s, name: e.target.value }))}
                className="w-40"
              />
              <Input
                placeholder="Tipo/Descrição"
                value={newService.description}
                onChange={e => setNewService(s => ({ ...s, description: e.target.value }))}
                className="w-32"
              />
              <Input
                placeholder="Valor (R$)"
                type="number"
                min="0"
                value={newService.price}
                onChange={e => setNewService(s => ({ ...s, price: e.target.value }))}
                className="w-28"
              />
              <Input
                placeholder="Duração (min)"
                type="number"
                min="1"
                value={newService.duration_minutes}
                onChange={e => setNewService(s => ({ ...s, duration_minutes: e.target.value }))}
                className="w-29"
              />
              <Button onClick={handleAddService} disabled={addingService}>Adicionar</Button>
            </div>
            {loadingServices ? (
              <div>Carregando serviços...</div>
            ) : services.length === 0 ? (
              <div>Nenhum serviço cadastrado.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-1 px-2 font-semibold">Nome</th>
                      <th className="py-1 px-2 font-semibold">Tipo</th>
                      <th className="py-1 px-2 font-semibold">Valor</th>
                      <th className="py-1 px-2 font-semibold">Duração</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map(service => (
                      <tr key={service.id} className="border-t">
                        {editServiceId === service.id ? (
                          <>
                            <td className="py-2 px-2">
                              <Input
                                value={editService?.name || ""}
                                onChange={e => setEditService((s: any) => ({ ...s, name: e.target.value }))}
                                placeholder="Nome"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <Input
                                value={editService?.description || ""}
                                onChange={e => setEditService((s: any) => ({ ...s, description: e.target.value }))}
                                placeholder="Tipo/Descrição"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <Input
                                type="number"
                                min="0"
                                value={editService?.price || ""}
                                onChange={e => setEditService((s: any) => ({ ...s, price: e.target.value }))}
                                placeholder="Valor"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <Input
                                type="number"
                                min="1"
                                value={editService?.duration_minutes || ""}
                                onChange={e => setEditService((s: any) => ({ ...s, duration_minutes: e.target.value }))}
                                placeholder="Duração"
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <div className="flex gap-1 justify-center">
                                <Button size="sm" onClick={() => handleSaveEditService(service.id)} disabled={savingService}>Salvar</Button>
                                <Button size="sm" variant="outline" onClick={() => {setEditServiceId(null); setEditService(null);}}>Cancelar</Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-2 px-2 whitespace-nowrap">{service.name}</td>
                            <td className="py-2 px-2 whitespace-nowrap text-muted-foreground">{service.description}</td>
                            <td className="py-2 px-2 whitespace-nowrap">R$ {Number(service.price).toFixed(2)}</td>
                            <td className="py-2 px-2 whitespace-nowrap">{service.duration_minutes} min</td>
                            <td className="py-2 px-2 text-center">
                              <div className="flex gap-1 justify-center">
                                <Button size="sm" variant="outline" onClick={() => handleEditService(service)}>Editar</Button>
                                <Button size="sm" variant="destructive" onClick={() => handleRemoveService(service.id)}>Remover</Button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </DashboardLayout>
    );
  } catch (err: any) {
    setFatalError(err?.message || 'Erro desconhecido');
    return null;
  }
}
