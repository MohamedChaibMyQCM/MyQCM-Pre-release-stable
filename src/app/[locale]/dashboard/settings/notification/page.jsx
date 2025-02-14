import Image from "next/image";
import notification from "../../../../../../public/settings/notification.svg";
import { Switch } from "@radix-ui/react-switch";

const page = () => {
  return (
    <div className="mx-5 bg-[#FFFFFF] py-5 px-6 mt-12 rounded-[16px]">
      <h3 className="text-[#191919] font-[500] mb-1">Email notifications</h3>
      <p className="text-[#666666] text-[13.6px]">
        Email notifications are enabled now, but you can disable them anytime.
      </p>
      <div>
        <div>
          <Switch className="text-[red] bg-[red]"/>
          <span>On</span>
        </div>
        <div>
          <div>
            <span>News and updates</span>
            <span>
              Receive email notifications whenever there are updates and news.
            </span>
          </div>
        </div>
        <div>
          <div>
            <span>Learning reminders</span>
            <span>
              Receive email reminders to stay on track with your learning.
            </span>
          </div>
        </div>
        <div>
          <div>
            <span>Subscription</span>
            <span>
              Receive email updates about your subscription, including important
              news and billing.
            </span>
          </div>
        </div>
      </div>
      <Image src={notification} alt="password" className="mx-auto mt-8" />
    </div>
  );
};

export default page;
