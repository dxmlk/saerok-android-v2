import CommunityCollectionListScreen from "@/components/nest/CommunityCollectionListScreen";
import { fetchCommunityPopularApi } from "@/services/api/community";

export default function NestPopularScreen() {
  return (
    <CommunityCollectionListScreen
      title="요즘 인기 있는 새록"
      emptyText="인기 새록이 없어요."
      fetchPage={fetchCommunityPopularApi}
      from="nest_popular"
      variant="popular"
    />
  );
}
