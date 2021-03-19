import Settings from "../pages/Settings";
import Contract from "../pages/Contract";
import Documents from "../pages/Documents";
import Edit from "../pages/Edit";

const routes = [
  {
    path: "/settings",
    component: Settings,
  },
  {
    path: "/contract/:contractId",
    component: Contract,
  },
  {
    path: "/contract/:contractId/:document",
    component: Documents,
  },
  {
    path: "/contract/:contractId/:document/:verb/:id?",
    component: Edit,
  },
];

export default routes;
