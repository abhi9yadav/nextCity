let navigateFunc = null;

export const setNavigate = (navigate) => {
  navigateFunc = navigate;
};

export const navigateTo = (path) => {
  if (navigateFunc) navigateFunc(path);
};
