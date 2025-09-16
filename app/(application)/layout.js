import { Provider } from "react-redux";
import Footer from "../_components/Footer/Footer";
import Header from "../_components/Header/Header";
import "@/app/_styles/globalStyles.css";
import store from "../store/store";
import styles from "./layout.module.css";
import { Toaster } from "react-hot-toast";
import PageTransition from "../_components/PageTransition/pageTransition";
import FooterMenu from "../_components/FooterMenu/FooterMenu";
import AppNav from "../_components/AppNav/AppNav-v1";
import UserProvider from "../_provider/UserProvider";

import IncomingCallModal from "../_components/IncomingCallModal.js/IncomingCallModal";
import CallUI from "../_components/CallUI/CallUI-v1";
import Stream from "../_components/Stream/Stream";
import SideBar from "../_components/SideBar/SideBar";
import PricingModal from "../_components/PricingModal/PricingModal";

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <div className={styles.appLayout}>
            <SideBar />

            <main
              style={{
                flexGrow: 1,
              }}
            >
              {/* <AppNav /> */}
              {children}
            </main>

            {/* <FooterMenu /> */}
            <Toaster position="top-left" reverseOrder={false} />

            {/* <Cookies /> */}
          </div>
          <PricingModal />
          <IncomingCallModal />
          <Stream />
        </UserProvider>
      </body>
    </html>
  );
}
