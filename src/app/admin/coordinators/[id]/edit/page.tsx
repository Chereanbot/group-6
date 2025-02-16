import { EditCoordinatorForm } from './EditCoordinatorForm';

export default async function EditCoordinatorPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const id = await Promise.resolve(params.id);
  return <EditCoordinatorForm id={id} />;
} 