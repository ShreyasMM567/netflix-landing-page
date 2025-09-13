import useSWR from "swr";
import fetcher from "@/lib/fetcher";

const useCurrentUser = () => {
    const { data, error, isLoading, mutate} = useSWR("/api/current", fetcher);

    // Debug logging
    console.log("useCurrentUser hook:", { data, error, isLoading });

    return { data, error, isLoading, mutate}
}

export default useCurrentUser;