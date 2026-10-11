import React from 'react';
import AppPageHeader from '@/components/AppPageHeader';

interface PageHeaderProps {
    title: string;
    onBack: () => void;
    rightElement?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, onBack, rightElement }) => {
  return (
    <AppPageHeader
      title={title}
      onBack={onBack}
      rightElement={rightElement}
      className="mb-6"
      titleClassName="text-2xl text-indigo-700"
    />
  );
};

export default PageHeader;
