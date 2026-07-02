import {
  Sparkles, Flame, Eye, Moon, Star, Target, Zap,
  Clock, Brain, Skull, Infinity, Timer, Mountain,
  Gem, BookOpen, FileText, MessageSquare, ArrowRight, Layers, Copy, Check,
} from "lucide-react";

export const iconMap = {
  Target, Zap, Clock, Brain, Sparkles, Flame, Eye, Moon, Skull, Star,
  Infinity, Timer, Mountain, Gem, BookOpen, FileText, MessageSquare,
  ArrowRight, Layers, Copy, Check,
} as const;

export const DISCIPLINE_PHRASES = [
  { category: "disciplina", text: "La disciplina supera a la motivación", subtext: "No esperes tener ganas. Solo hazlo.", icon: "Target" },
  { category: "consistencia", text: "Pequeños avances diarios = grandes resultados", subtext: "1% mejor cada día es 37x mejor en un año", icon: "TrendingUp" },
  { category: "enfoque", text: "Haz lo que tienes que hacer, incluso cuando no quieras", subtext: "Esa es la verdadera disciplina", icon: "Zap" },
  { category: "persistencia", text: "El éxito es la suma de pequeños esfuerzos repetidos", subtext: "La consistencia es tu superpoder", icon: "Clock" },
  { category: "mentalidad", text: "Tu único límite es tu mente", subtext: "Cree en tu capacidad de aprender", icon: "Brain" },
  { category: "acción", text: "El momento perfecto es ahora", subtext: "No esperes el momento ideal, créalo", icon: "Sparkles" },
];

export const PHILOSOPHICAL_PHRASES = [
  { category: "existencia", text: "Existir es resistirse al vacío", subtext: "Cada acto de creación es un acto de rebeldía", icon: "Infinity" },
  { category: "propósito", text: "El significado no se encuentra, se crea", subtext: "Eres el arquitecto de tu propio propósito", icon: "Gem" },
  { category: "voluntad", text: "Lo que no me mata me hace más fuerte", subtext: "Nietzsche", icon: "Flame" },
  { category: "conocimiento", text: "Solo sé que nada sé", subtext: "Sócrates", icon: "Eye" },
  { category: "tiempo", text: "El tiempo es la imagen móvil de la eternidad", subtext: "Platón", icon: "Timer" },
  { category: "esencia", text: "La esencia precede a la existencia", subtext: "Sartre", icon: "Star" },
];

export const DARK_PHRASES = [
  { category: "mortalidad", text: "Memento Mori - Recuerda que morirás", subtext: "Vive como si fuera tu último día", icon: "Skull" },
  { category: "dolor", text: "El dolor es inevitable, el sufrimiento es opcional", subtext: "Buda", icon: "Moon" },
  { category: "soledad", text: "Al final caminas solo", subtext: "En esa soledad encuentras tu fuerza", icon: "Mountain" },
  { category: "vacío", text: "El vacío no se llena, se acepta", subtext: "En el silencio encuentras tu voz", icon: "Eye" },
  { category: "oscuridad", text: "Incluso la noche más oscura termina con el amanecer", subtext: "Victor Hugo", icon: "Sun" },
  { category: "resiliencia", text: "Caer está permitido, levantarse es obligatorio", subtext: "Cada caída es una oportunidad", icon: "Heart" },
];

export const REMEMBER_PHRASES = [
  { category: "origen", text: "Recuerda por qué empezaste", subtext: "Esa versión de ti que soñaba en grande", icon: "Sparkles" },
  { category: "sueños", text: "Tu yo del futuro te lo agradecerá", subtext: "Estudia hoy para vivir mañana", icon: "Star" },
  { category: "legado", text: "Estás construyendo tu legado", subtext: "Cada hora es un ladrillo en tu imperio", icon: "Mountain" },
  { category: "familia", text: "Ellos creen en ti", subtext: "Haz que tu esfuerzo sea su orgullo", icon: "Heart" },
  { category: "versión", text: "La mejor versión de ti te está esperando", subtext: "No la decepciones", icon: "Gem" },
  { category: "razón", text: "Tu 'por qué' es más fuerte que tu 'cómo'", subtext: "Cuando tienes una razón clara, el camino se abre", icon: "Target" },
];

export const getCategoryPhrases = (cat: string) => {
  switch (cat) {
    case "philosophical": return PHILOSOPHICAL_PHRASES;
    case "dark": return DARK_PHRASES;
    case "remember": return REMEMBER_PHRASES;
    default: return DISCIPLINE_PHRASES;
  }
};

export const FALLBACK_QUOTES = [
  { content: "La educación es el arma más poderosa que puedes usar para cambiar el mundo", author: "Nelson Mandela" },
  { content: "El conocimiento es poder", author: "Francis Bacon" },
  { content: "La mente que se abre a una nueva idea jamás volverá a su tamaño original", author: "Albert Einstein" },
];
