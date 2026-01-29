import { ReactNode, useState, useEffect } from 'react';

interface SidebarLinkGroupProps {
  children: (handleClick: () => void, open: boolean) => ReactNode;
  activeCondition: boolean;
}

const SidebarLinkGroup = ({
  children,
  activeCondition,
}: SidebarLinkGroupProps) => {
  const [open, setOpen] = useState<boolean>(activeCondition);

  useEffect(() => {
    if (activeCondition) setOpen(true);
  }, [activeCondition]);

  const handleClick = () => {
    setOpen(!open);
  };

  return <li>{children(handleClick, open)}</li>;
};

export default SidebarLinkGroup;