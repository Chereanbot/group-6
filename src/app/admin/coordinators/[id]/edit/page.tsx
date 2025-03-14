import { EditCoordinatorForm } from './EditCoordinatorForm';

export default function EditCoordinatorPage({
  params
}: {
  params: { id: string }
}) {
  return <EditCoordinatorForm id={params.id} />;
} 