import { useParams } from "react-router-dom";
import WorkerDetailPage from "../../components/deptAdmin/WorkerDetailPage";

const WorkerDetailWrapper = () => {
  const { id } = useParams();
  return <WorkerDetailPage workerId={id} />;
};

export default WorkerDetailWrapper;
