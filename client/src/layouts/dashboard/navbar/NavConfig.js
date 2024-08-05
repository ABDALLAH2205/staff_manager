// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import Label from '../../../components/Label';
import SvgIconStyle from '../../../components/SvgIconStyle';
import { useSelector } from 'react-redux';

// ----------------------------------------------------------------------

const getIcon = (name) => <SvgIconStyle src={`/icons/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const ICONS = {
  blog: getIcon('ic_blog'),
  cart: getIcon('ic_cart'),
  chat: getIcon('ic_chat'),
  mail: getIcon('ic_mail'),
  user: getIcon('ic_user'),
  kanban: getIcon('ic_kanban'),
  banking: getIcon('ic_banking'),
  booking: getIcon('ic_booking'),
  invoice: getIcon('ic_invoice'),
  calendar: getIcon('ic_calendar'),
  ecommerce: getIcon('ic_ecommerce'),
  analytics: getIcon('ic_analytics'),
  dashboard: getIcon('ic_dashboard'),
};

// const { user } = useSelector((state) => state.user);

let isAdmin = false;
// if (user) {
//   isAdmin = user?.isAdmin;
// }
// if (typeof localStorage !== 'undefined') {
//   isAdmin = localStorage.getItem('loggedIsAdmin') || false;
// }

// const isAdmin = false;

let nav = [];

export const NAV_CONFIG = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: 'Demandes',
    items: [
      // { title: 'app', path: PATH_DASHBOARD.general.app, icon: ICONS.dashboard },
      // { title: 'e-commerce', path: PATH_DASHBOARD.general.ecommerce, icon: ICONS.ecommerce },
      // { title: 'analytics', path: PATH_DASHBOARD.general.analytics, icon: ICONS.analytics },
      // { title: 'banking', path: PATH_DASHBOARD.general.banking, icon: ICONS.banking },
      {
        title: 'Demandes',
        path: PATH_DASHBOARD.general.booking,
        icon: ICONS.booking,
        icon: ICONS.user,
        children: [
          { title: 'Creer une demande', path: PATH_DASHBOARD.general.booking },
          // { title: 'Toutes les Demandes', path: PATH_DASHBOARD.general.userRequest },
          { title: 'Mes demandes', path: PATH_DASHBOARD.general.userRequest },
          // { title: 'profile', path: PATH_DASHBOARD.user.profile },
          // { title: 'cards', path: PATH_DASHBOARD.user.cards },
          // { title: 'edit', path: PATH_DASHBOARD.user.demoEdit },
          // { title: 'account', path: PATH_DASHBOARD.user.account },
        ],
      },
      // { title: 'Toutes les Demandes', path: PATH_DASHBOARD.general.booking, icon: ICONS },
      // { title: 'Toutes les Demandes', path: PATH_DASHBOARD.general.userRequest, icon: ICONS.banking },
      // { title: 'Toutes les Demandes', path: PATH_DASHBOARD.general.userRequest, icon: ICONS.banking },
    ],
  },

  // MANAGEMENT
  // ----------------------------------------------------------------------
  {
    subheader: 'Parameters',
    items: [
      // USER
      {
        title: 'Mon compte',
        path: PATH_DASHBOARD.user.account,
        icon: ICONS.user,
        // children: [
        //   // { title: 'liste des utilisateurs', path: PATH_DASHBOARD.user.list },
        //   // { title: 'Ajouter', path: PATH_DASHBOARD.user.new },
        //   // { title: 'profile', path: PATH_DASHBOARD.user.profile },
        //   // { title: 'cards', path: PATH_DASHBOARD.user.cards },
        //   // { title: 'edit', path: PATH_DASHBOARD.user.demoEdit },
        //   { title: 'account', path: PATH_DASHBOARD.user.account },
        // ],
      },

      // E-COMMERCE
      // {
      //   title: 'e-commerce',
      //   path: PATH_DASHBOARD.eCommerce.root,
      //   icon: ICONS.cart,
      //   children: [
      //     { title: 'shop', path: PATH_DASHBOARD.eCommerce.shop },
      //     { title: 'product', path: PATH_DASHBOARD.eCommerce.demoView },
      //     { title: 'list', path: PATH_DASHBOARD.eCommerce.list },
      //     { title: 'create', path: PATH_DASHBOARD.eCommerce.new },
      //     { title: 'edit', path: PATH_DASHBOARD.eCommerce.demoEdit },
      //     { title: 'checkout', path: PATH_DASHBOARD.eCommerce.checkout },
      //   ],
      // },

      // INVOICE
      // {
      //   title: 'invoice',
      //   path: PATH_DASHBOARD.invoice.root,
      //   icon: ICONS.invoice,
      //   children: [
      //     { title: 'list', path: PATH_DASHBOARD.invoice.list },
      //     { title: 'details', path: PATH_DASHBOARD.invoice.demoView },
      //     { title: 'create', path: PATH_DASHBOARD.invoice.new },
      //     { title: 'edit', path: PATH_DASHBOARD.invoice.demoEdit },
      //   ],
      // },

      // BLOG
      // {
      //   title: 'blog',
      //   path: PATH_DASHBOARD.blog.root,
      //   icon: ICONS.blog,
      //   children: [
      //     { title: 'posts', path: PATH_DASHBOARD.blog.posts },
      //     { title: 'post', path: PATH_DASHBOARD.blog.demoView },
      //     { title: 'create', path: PATH_DASHBOARD.blog.new },
      //   ],
      // },
    ],
  },

  // APP
  // ----------------------------------------------------------------------
  // {
  //   subheader: 'app',
  //   items: [
  //     {
  //       title: 'mail',
  //       path: PATH_DASHBOARD.mail.root,
  //       icon: ICONS.mail,
  //       info: (
  //         <Label variant="outlined" color="error">
  //           +32
  //         </Label>
  //       ),
  //     },
  //     { title: 'chat', path: PATH_DASHBOARD.chat.root, icon: ICONS.chat },
  //     { title: 'calendar', path: PATH_DASHBOARD.calendar, icon: ICONS.calendar },
  //     { title: 'kanban', path: PATH_DASHBOARD.kanban, icon: ICONS.kanban },
  //   ],
  // },
];

export const NAV_ADMIN_CONFIG = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: 'Demandes',
    items: [
      {
        title: 'Demandes',
        path: PATH_DASHBOARD.general.booking,
        icon: ICONS.booking,
        icon: ICONS.user,
        children: [
          { title: 'Creer une demande', path: PATH_DASHBOARD.general.booking },
          { title: 'Toutes les Demandes', path: PATH_DASHBOARD.general.userRequest },
        ],
      },
    ],
  },

  // MANAGEMENT
  // ----------------------------------------------------------------------
  {
    subheader: 'Administration',
    items: [
      // USER
      {
        title: 'utilisateurs',
        path: PATH_DASHBOARD.user.root,
        icon: ICONS.user,
        children: [
          { title: 'liste des utilisateurs', path: PATH_DASHBOARD.user.list },
          // { title: 'Ajouter', path: PATH_DASHBOARD.user.new },
        ],
      },
    ],
  },
];

nav = isAdmin ? NAV_ADMIN_CONFIG : NAV_CONFIG;

export default nav;
