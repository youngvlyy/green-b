import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import axios from "axios";

export const useAuth = () => {
  const [user, setUser] = useState<{ uid: string; email: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (!firebaseUser) {
        setUser(null);
        return;
      }
      const token = await auth.currentUser?.getIdToken();
      const uid = firebaseUser.uid;
      const email = firebaseUser.email || "";
      setUser({ uid, email });

      // try {
      //   await axios
      //     .get(`/api/user/${uid}/${email}`, {
      //       headers: {
      //         Authorization: `${token}`,
      //       },
      //     })
      //     .then(async (res) => {
      //       if (!res.data) {
      //         //새 유저 생성
      //         await axios.post(`/api/signup`, { uid, email });
      //         console.warn("새 유저 생성 완료");
      //         return;
      //       }
      //       console.log("기존 유저 데이터:", res.data);
      //     });
      // } catch (err) {
      //   console.error("유저 확인 중 오류:", err);
      // }
    }
  );

    return () => unsubscribe();
  }, []);

  return user;
};
