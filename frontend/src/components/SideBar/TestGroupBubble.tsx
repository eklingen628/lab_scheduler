import './Sidebar.css';

interface Props {
  groupId: number;
  sampleIds: string[];
  testNames: string[];
}

export default function TestGroupBubble({ groupId, sampleIds, testNames }: Props) {
  const uniqueTestNames = [...new Set(testNames)];

  return (
    <div
      className="sidebar-bubble"
      title={sampleIds.length > 0 ? `Samples: ${sampleIds.join(', ')}` : undefined}
    >
      <p className="sidebar-bubble-title">Group {groupId}</p>
      {uniqueTestNames.map(name => (
        <p key={name}>{name}</p>
      ))}
    </div>
  );
}
