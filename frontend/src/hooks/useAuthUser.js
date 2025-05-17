import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api.js";

export default function useAuthUser() {
  const authUser = useQuery({
  queryKey: ["authUser"],
  queryFn: getAuthUser,
  retry: false
 });
 return {isLoading: authUser?.isLoading, isError: authUser?.isError, authData: authUser?.data};
}