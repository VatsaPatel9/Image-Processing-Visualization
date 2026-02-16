import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

function TopicSelector({ topics, selectedTopicId, onTopicChange }) {
  return (
    <Tabs value={selectedTopicId} onValueChange={onTopicChange}>
      <TabsList className="flex w-fit">
        {topics.map(topic => (
          <TabsTrigger key={topic.id} value={topic.id} className="gap-2 px-4 text-sm">
            <span>{topic.icon}</span>
            {topic.title}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

export default TopicSelector;
