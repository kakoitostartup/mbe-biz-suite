import { useMemo, useState } from "react";
import { useServices, Project, ProjectStatus, projectStatusLabel } from "./servicesStore";
import { useStore } from "./store";
import { SectionHeader, Widget } from "./ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Calendar, Users, Trash2, ArrowLeft, Wallet, Briefcase, AlertTriangle,
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { ru } from "date-fns/locale";
import {
  DndContext, DragEndEvent, PointerSensor, useDroppable, useDraggable, useSensor, useSensors,
} from "@dnd-kit/core";

type ColId = "todo" | "in_progress" | "done";

const columns: { id: ColId; label: string }[] = [
  { id: "todo", label: "Запланировано" },
  { id: "in_progress", label: "В работе" },
  { id: "done", label: "Завершено" },
];

// ============ Create project form ============
const NewProjectForm = ({ onCreated }: { onCreated?: (p: Project) => void }) => {
  const { addProject } = useServices();
  const { staff } = useStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState(format(new Date(), "yyyy-MM-dd"));
  const [deadline, setDeadline] = useState(format(new Date(Date.now() + 14 * 86400000), "yyyy-MM-dd"));
  const [ownerId, setOwnerId] = useState<string | undefined>(staff[0]?.id);
  const [budget, setBudget] = useState("0");
  const [status, setStatus] = useState<ProjectStatus>("active");

  const submit = () => {
    if (!name.trim()) return;
    const p = addProject({
      name: name.trim(),
      description: description.trim() || undefined,
      startAt: new Date(`${startAt}T00:00`).toISOString(),
      deadline: new Date(`${deadline}T23:59`).toISOString(),
      ownerId,
      budget: Number(budget) || 0,
      status,
    });
    setName(""); setDescription(""); setBudget("0");
    onCreated?.(p);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
      <div className="md:col-span-2">
        <Label>Название *</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Запуск нового салона" />
      </div>
      <div className="md:col-span-2">
        <Label>Описание</Label>
        <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <Label>Дата начала</Label>
        <Input type="date" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
      </div>
      <div>
        <Label>Дедлайн</Label>
        <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </div>
      <div>
        <Label>Ответственный</Label>
        <Select value={ownerId} onValueChange={setOwnerId}>
          <SelectTrigger><SelectValue placeholder="Выберите сотрудника" /></SelectTrigger>
          <SelectContent>
            {staff.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Бюджет, ₽</Label>
        <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
      </div>
      <div className="md:col-span-2">
        <Label>Статус</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {(Object.keys(projectStatusLabel) as ProjectStatus[]).map((k) => (
              <SelectItem key={k} value={k}>{projectStatusLabel[k]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-2">
        <Button onClick={submit}><Plus className="h-4 w-4 mr-1" /> Сохранить проект</Button>
      </div>
    </div>
  );
};

// ============ Project board (DnD) ============
const TaskCard = ({ id, title, assignee, due }: { id: string; title: string; assignee?: string; due: string }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className="rounded-lg hairline bg-card p-3 cursor-grab active:cursor-grabbing space-y-1"
    >
      <div className="text-sm font-medium">{title}</div>
      <div className="text-[11px] text-muted-foreground flex items-center justify-between">
        <span>{assignee ?? "—"}</span>
        <span>{format(parseISO(due), "d MMM", { locale: ru })}</span>
      </div>
    </div>
  );
};

const Column = ({ id, label, children }: { id: ColId; label: string; children: React.ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl hairline bg-secondary/30 p-3 min-h-[300px] space-y-2 transition-colors ${isOver ? "bg-secondary/60" : ""}`}
    >
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground px-1">{label}</div>
      {children}
    </div>
  );
};

const ProjectBoard = ({ project, onBack }: { project: Project; onBack: () => void }) => {
  const { tasks, addTask, updateInventory: _u, toggleTask, removeTask, staff } = useStore();
  // We need a dedicated updater for task fields
  const setTasks = useStore.setState;

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const groups: Record<ColId, typeof tasks> = {
    todo: projectTasks.filter((t) => (t.status ?? (t.done ? "done" : "todo")) === "todo"),
    in_progress: projectTasks.filter((t) => t.status === "in_progress"),
    done: projectTasks.filter((t) => (t.status ?? (t.done ? "done" : "todo")) === "done"),
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const onDragEnd = (e: DragEndEvent) => {
    const taskId = String(e.active.id);
    const col = e.over?.id as ColId | undefined;
    if (!col) return;
    setTasks((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId ? { ...t, status: col, done: col === "done" } : t
      ),
    }));
  };

  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState<string | undefined>(staff[0]?.id);
  const addNew = () => {
    if (!newTitle.trim()) return;
    addTask({
      title: newTitle.trim(),
      due: new Date(Date.now() + 86400000).toISOString(),
      projectId: project.id,
      status: "todo",
      assignee: newAssignee,
    } as any);
    setNewTitle("");
  };

  // Progress
  const total = projectTasks.length;
  const completed = groups.done.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  const daysLeft = differenceInDays(parseISO(project.deadline), new Date());
  const overdue = daysLeft < 0 && project.status !== "done";

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-1" /> К списку</Button>
        <h2 className="text-xl font-semibold">{project.name}</h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{projectStatusLabel[project.status]}</span>
      </div>

      <Widget id={`project.${project.id}.progress`} title="Прогресс проекта">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-[11px] uppercase text-muted-foreground">Выполнено</div>
            <div className="text-2xl font-semibold">{pct}%</div>
            <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">{completed} из {total} задач</div>
          </div>
          <div>
            <div className="text-[11px] uppercase text-muted-foreground">Сроки</div>
            <div className={`text-2xl font-semibold ${overdue ? "text-destructive" : ""}`}>
              {overdue ? `Просрочено на ${Math.abs(daysLeft)} дн.` : `${daysLeft} дн. до дедлайна`}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              <Calendar className="h-3 w-3 inline mr-1" />
              {format(parseISO(project.startAt), "d MMM", { locale: ru })} — {format(parseISO(project.deadline), "d MMM", { locale: ru })}
            </div>
            {overdue && <div className="text-[11px] text-destructive mt-1 inline-flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Требуется внимание</div>}
          </div>
          <div>
            <div className="text-[11px] uppercase text-muted-foreground">Бюджет</div>
            <div className="text-2xl font-semibold">{project.budget.toLocaleString("ru-RU")} ₽</div>
            <div className="text-[11px] text-muted-foreground mt-1">Ответственный: {staff.find((s) => s.id === project.ownerId)?.name ?? "—"}</div>
          </div>
        </div>
      </Widget>

      <Widget id={`project.${project.id}.add`} title="Быстро добавить задачу" defaultCollapsed>
        <div className="flex gap-2 flex-wrap">
          <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Название задачи" className="flex-1 min-w-[200px]" />
          <Select value={newAssignee} onValueChange={setNewAssignee}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Исполнитель" /></SelectTrigger>
            <SelectContent>
              {staff.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={addNew}><Plus className="h-4 w-4 mr-1" /> Добавить</Button>
        </div>
      </Widget>

      <Widget id={`project.${project.id}.board`} title="Доска проекта" subtitle="Перетаскивайте задачи между колонками">
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {columns.map((c) => (
              <Column key={c.id} id={c.id} label={c.label}>
                {groups[c.id].length === 0 ? (
                  <div className="text-[11px] text-muted-foreground text-center py-6">Пусто</div>
                ) : (
                  groups[c.id].map((t) => (
                    <div key={t.id} className="group relative">
                      <TaskCard
                        id={t.id}
                        title={t.title}
                        assignee={staff.find((s) => s.id === (t as any).assignee)?.name}
                        due={t.due}
                      />
                      <button
                        onClick={() => removeTask(t.id)}
                        className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </Column>
            ))}
          </div>
        </DndContext>
      </Widget>
    </div>
  );
};

// ============ Page ============
export const ProjectsPage = () => {
  const { projects, removeProject } = useServices();
  const { tasks, staff } = useStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const project = projects.find((p) => p.id === selected);
  if (project) {
    return <ProjectBoard project={project} onBack={() => setSelected(null)} />;
  }

  const projectStats = (id: string) => {
    const list = tasks.filter((t) => t.projectId === id);
    const done = list.filter((t) => (t.status ?? (t.done ? "done" : "todo")) === "done").length;
    return { total: list.length, done, pct: list.length ? Math.round((done / list.length) * 100) : 0 };
  };

  return (
    <div className="space-y-4 fade-in">
      <SectionHeader
        title="Проекты"
        subtitle="Группируйте задачи по крупным целям."
        action={
          <Button onClick={() => setShowForm((v) => !v)} className="h-9">
            <Plus className="h-4 w-4 mr-1" /> {showForm ? "Скрыть форму" : "Создать проект"}
          </Button>
        }
      />

      {showForm && (
        <Widget id="projects.form" title="Новый проект">
          <NewProjectForm onCreated={() => setShowForm(false)} />
        </Widget>
      )}

      <Widget id="projects.list" title="Список проектов" subtitle={`Всего: ${projects.length}`}>
        {projects.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">Пока нет проектов — создайте первый.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.map((p) => {
              const st = projectStats(p.id);
              const daysLeft = differenceInDays(parseISO(p.deadline), new Date());
              const overdue = daysLeft < 0 && p.status !== "done";
              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  className="text-left rounded-xl hairline bg-card p-4 hover:bg-secondary/40 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="font-medium truncate">{p.name}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      p.status === "active" ? "bg-emerald-500/15 text-emerald-400" :
                      p.status === "paused" ? "bg-amber-500/15 text-amber-400" :
                      "bg-muted text-muted-foreground"
                    }`}>{projectStatusLabel[p.status]}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${st.pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{st.done}/{st.total} задач · {st.pct}%</span>
                    <span className={overdue ? "text-destructive" : ""}>
                      {overdue ? `Просрочено ${Math.abs(daysLeft)}д` : `${daysLeft}д до дедлайна`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Wallet className="h-3 w-3" /> {p.budget.toLocaleString("ru-RU")} ₽</span>
                    <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {staff.find((s) => s.id === p.ownerId)?.name ?? "—"}</span>
                  </div>
                  <div className="flex justify-end">
                    <span
                      role="button"
                      onClick={(e) => { e.stopPropagation(); removeProject(p.id); }}
                      className="text-[11px] text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Удалить
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Widget>
    </div>
  );
};
