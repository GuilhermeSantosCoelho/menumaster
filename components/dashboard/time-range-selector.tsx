import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type TimeRangeSelectorProps = {
  value: 'day' | 'month' | 'year';
  onChange: (value: 'day' | 'month' | 'year') => void;
};

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <Tabs
      defaultValue={value}
      onValueChange={(value) => onChange(value as 'day' | 'month' | 'year')}
    >
      <TabsList>
        <TabsTrigger value="day">Hoje</TabsTrigger>
        <TabsTrigger value="month">Este Mês</TabsTrigger>
        <TabsTrigger value="year">Este Ano</TabsTrigger>
      </TabsList>
    </Tabs>
  );
} 