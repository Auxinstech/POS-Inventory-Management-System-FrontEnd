import { useAppSelector } from "../../Hook/hooks";

const Loader = () => {
  const loader = useAppSelector((x) => x.Loader);

  if (loader.toggle) {
    return (
      <div className="loader">
        {
          loader.loadingText ?
            <div className="position-absolute px-4 py-2 rounded mt-5 top-0 bg-white">{loader.loadingText}</div>
            : null
        }
        <div className="dots-spinner">
          <span className="dot-1"></span>
          <span className="dot-2"></span>
          <span className="dot-3"></span>
        </div>
      </div>
    );
  }
  else
    return null;
};

export default Loader;
