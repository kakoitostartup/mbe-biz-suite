import { useState } from "react";
import { useServices } from "./servicesStore";
import { SectionHeader, Widget } from "./ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Pencil, Clock, Wallet } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export const ServicesPage = ({ focus }: { focus?: "list" | "add" }) => {
  const { services, addService, updateService, removeService } = useServices();
  const [editing, setEditing] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("30");
  const [description, setDescription] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    addService({
      name: name.trim(),
      price: Number(price) || 0,
      durationMin: Number(duration) || 30,
      description: description.trim() || undefined,
    });
    setName(""); setPrice(""); setDuration("30"); setDescription("");
  };

  if (focus === "add") {
    return (
      <div className="fade-in space-y-4">
        <SectionHeader title="Новая услуга" />
        <Widget id="services.form" title="Создать услугу">
          <div className="space-y-3 max-w-xl">
            <div><Label>Название *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Маникюр классический" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Цена, ₽</Label><Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
              <div><Label>Длительность, мин</Label><Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} /></div>
            </div>
            <div><Label>Описание</Label><Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <Button onClick={submit}><Plus className="h-4 w-4 mr-1" /> Сохранить</Button>
          </div>
        </Widget>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-4">
      <SectionHeader title="Услуги" subtitle="Каталог услуг вашего бизнеса." />
      <Widget id="services.list" title="Список услуг" subtitle={`Всего: ${services.length}`}>
        {services.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">Пока нет услуг — добавьте первую.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {services.map((s) => (
              <div key={s.id} className="rounded-xl hairline bg-secondary/30 p-4 space-y-2">
                {editing === s.id ? (
                  <div className="space-y-2">
                    <Input defaultValue={s.name} onBlur={(e) => updateService(s.id, { name: e.target.value })} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input type="number" defaultValue={s.price} onBlur={(e) => updateService(s.id, { price: Number(e.target.value) })} />
                      <Input type="number" defaultValue={s.durationMin} onBlur={(e) => updateService(s.id, { durationMin: Number(e.target.value) })} />
                    </div>
                    <Button size="sm" onClick={() => setEditing(null)}>Готово</Button>
                  </div>
                ) : (
                  <>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3">
                      <span className="inline-flex items-center gap-1"><Wallet className="h-3 w-3" /> {s.price.toLocaleString("ru-RU")} ₽</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {s.durationMin} мин</span>
                    </div>
                    {s.description && <div className="text-xs text-muted-foreground">{s.description}</div>}
                    <div className="flex gap-1 pt-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(s.id)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeService(s.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </Widget>
    </div>
  );
};
