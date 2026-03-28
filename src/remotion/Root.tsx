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
        durationInFrames={55 * 30} // 55 seconds
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TheTension"
        component={TheTension}
        durationInFrames={30 * 30} // 30 seconds
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
