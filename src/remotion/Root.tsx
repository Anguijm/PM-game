import { Composition } from "remotion";
import { DrydockTrailer } from "./DrydockTrailer";
import { GameplayOverview } from "./GameplayOverview";
import { TheTension } from "./TheTension";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DrydockTrailer"
        component={DrydockTrailer}
        durationInFrames={660}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="GameplayOverview"
        component={GameplayOverview}
        durationInFrames={58 * 30} // 58 seconds
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TheTension"
        component={TheTension}
        durationInFrames={36 * 30} // 36 seconds
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
