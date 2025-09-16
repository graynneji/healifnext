import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { supabase } from "../_lib/supabase";
import { addMessage } from "../store/chat/chatSlice";

export function useChatSubscription(userId, receiverId) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId || !receiverId) return;

    const channel = supabase
      .channel(`chat-${userId}-${receiverId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          dispatch(addMessage(payload.new));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, receiverId, dispatch]);
}
