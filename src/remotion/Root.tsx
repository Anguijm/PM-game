import { Composition } from "remotion";
import { DrydockTrailer } from "./DrydockTrailer";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="DrydockTrailer"
      component={DrydockTrailer}
      durationInFrames={660} // 22 seconds at 30fps
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
