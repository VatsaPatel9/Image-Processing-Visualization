import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function OperationSelector({ subtopics, selectedSubtopicId, onSubtopicChange }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-muted-foreground whitespace-nowrap">
        Operation:
      </label>
      <Select value={selectedSubtopicId} onValueChange={onSubtopicChange}>
        <SelectTrigger className="w-[240px] h-9">
          <SelectValue placeholder="Select an operation" />
        </SelectTrigger>
        <SelectContent>
          {subtopics.map(st => (
            <SelectItem key={st.id} value={st.id}>
              {st.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default OperationSelector;
