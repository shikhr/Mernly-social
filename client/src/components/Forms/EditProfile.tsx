import { useNavigate } from 'react-router-dom';
import Modal from '../UI/Modal';
import Overlay from '../UI/Overlay';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { useAppContext } from '../../context/AppContext';
import EditProfileForm from './EditProfileForm';

const EditProfile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getProfile, user, authFetch, updateUser } = useAppContext();

  const updateProfileHandler = async (formData: FormData) => {
    return authFetch.patch('/users/profile', formData);
  };

  const { mutate: updateProfile } = useMutation(updateProfileHandler, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      updateUser(data.data);
      navigate('/profile/me', { replace: true });
    },
  });

  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useQuery(['profile', 'me'], getProfile, {
    refetchOnWindowFocus: false,
    retry: false,
  });

  const closeFormHandler = () => {
    navigate(-1);
  };

  return (
    <div>
      <Overlay closeModal={closeFormHandler} />
      <Modal>
        <>
          {!profile && (
            <div className="h-[80vh] flex justify-center items-center text-text-primary-dark">
              {isLoading && <div>loading</div>}
              {isError && <div>Something Went Wrong!</div>}
            </div>
          )}
          {profile && (
            <EditProfileForm
              profile={profile}
              closeHandler={closeFormHandler}
              updateProfile={updateProfile}
            />
          )}
        </>
      </Modal>
    </div>
  );
};

export default EditProfile;
