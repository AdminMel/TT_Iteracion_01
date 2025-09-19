import * as Icons from "../icons";
import { UI_ELEMENTS } from "./ui-elements-list";

export const NAV_DATA = [
  {
    label: "Menú Principal",
    items: [
      {
        title: "Inicio",
        url: "/",
        icon: Icons.HomeIcon,
        items: [],
      },
      {
        title: "Calendario",
        url: "/calendar",
        icon: Icons.Calendar,
        items: [],
      },
      {
        title: "Perfil",
        url: "/profile",
        icon: Icons.User,
        items: [],
      },
      {
        title: "Tareas",
        url: "/tasks/task-kanban",
        icon: Icons.CheckList,
        items: [],
      },
      {
        title: "Foros",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Form Elements",
            url: "/forms/form-elements",
          },
          {
            title: "Pro Form Elements",
            url: "/forms/pro-form-elements",
            isPro: true,
          },
          {
            title: "Form Layout",
            url: "/forms/form-layout",
          },
          {
            title: "Pro Form Layout",
            url: "/forms/pro-form-layout",
            isPro: true,
          },
        ],
      },
    ],
  },
  {
    label: "Soporte",
    items: [
      {
        title: "Mensajes",
        url: "/messages",
        icon: Icons.Chat,
        badge: 9,
        items: [],
      },
    ],
  },
  {
    label: "Otros",
    items: [
      {
        title: "Analíticas",
        url: "/charts/advanced-chart",
        icon: Icons.PieChart,
        items: [],
      },
    ],
  },
];
