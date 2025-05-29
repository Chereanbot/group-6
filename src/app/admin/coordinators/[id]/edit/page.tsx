import { EditCoordinatorForm } from './EditCoordinatorForm';

export default async function EditCoordinatorPage({
  params
}: {
  params: { id: string }
}) {
  // Validate the ID parameter
  if (!params.id) {
    throw new Error('Coordinator ID is required');
  }

  return <EditCoordinatorForm id={params.id} />;
} 