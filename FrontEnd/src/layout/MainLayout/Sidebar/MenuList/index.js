import React from 'react';

// material-ui

// project import
import NavGroup from './NavGroup';
import NavigationItems from 'menu-items';

// ==============================|| MENULIST ||============================== //

const MenuList = () => {
  const menuItem = NavigationItems();
  const navItems = menuItem.items.map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
    }
  });

  return navItems;
};

export default MenuList;
