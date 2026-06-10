import CommunityCollectionListScreen from "@/components/nest/CommunityCollectionListScreen";
import { fetchCommunityPendingBirdIdApi } from "@/services/api/community";

export default function NestHelpScreen() {
  return (
    <CommunityCollectionListScreen
      title="이 새 이름이 뭔가요?"
      emptyText="동정 요청이 없어요."
      fetchPage={fetchCommunityPendingBirdIdApi}
      from="nest_help"
      variant="pending"
    />
  );
}
