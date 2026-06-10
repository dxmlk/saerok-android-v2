import CommunityCollectionListScreen from "@/components/nest/CommunityCollectionListScreen";
import { fetchCommunityRecentApi } from "@/services/api/community";

export default function NestRecentScreen() {
  return (
    <CommunityCollectionListScreen
      title="최근에 올라온 새록"
      emptyText="최근 새록이 없어요."
      fetchPage={fetchCommunityRecentApi}
      from="nest_recent"
      variant="recent"
    />
  );
}
