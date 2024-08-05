import * as Yup from 'yup';
import { useEffect, useState } from 'react';
// next
import NextLink from 'next/link';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Link, Stack, Alert, IconButton, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// routes
import { PATH_AUTH, PATH_DASHBOARD } from '../../../routes/paths';
// hooks
import useIsMountedRef from '../../../hooks/useIsMountedRef';
// components
import Iconify from '../../../components/Iconify';
import { FormProvider, RHFTextField, RHFCheckbox } from '../../../components/hook-form';
import { login } from 'src/redux/slices/user';
import { useSnackbar } from 'notistack';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';

// ----------------------------------------------------------------------

export default function LoginForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  // const history = useHIs();

  const { user, error, success, isLoading } = useSelector((state) => state.user);

  const { enqueueSnackbar } = useSnackbar();
  const isMountedRef = useIsMountedRef();
  const [showPassword, setShowPassword] = useState(false);

  const LoginSchema = Yup.object().shape({
    matemp: Yup.string().required('Le matricule est requis'),
    password: Yup.string().required('Mot de passe requis'),
  });

  const defaultValues = { matemp: '', password: '', remember: true };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      if (data && data.matemp && data.password) {
        await dispatch(login(data.matemp, data.password));
      }
    } catch (error) {
      reset();
      if (isMountedRef.current) {
        setError('afterSubmit', { ...error, message: error.message });
      }
    }
  };

  useEffect(() => {
    if (!isLoading && success && !error) {
      enqueueSnackbar('Connexion reussie');
      // if (user.isAdmin) {
      //   router.replace(PATH_DASHBOARD.general.userRequest) + '?first-logged=1';
      // } else {
      //   router.replace(PATH_DASHBOARD.general.booking) + '?first-logged=1';
      // }

      if (user.isAdmin) {
        router.replace(`${PATH_DASHBOARD.general.userRequest}?new-logged=1`);
      } else {
        router.replace(`${PATH_DASHBOARD.general.booking}?new-logged=1`);
      }
    }

    if (!isLoading && !success && error) {
      enqueueSnackbar('Connexion échouée', { variant: 'error' });
    }
  }, [user, success, isLoading, enqueueSnackbar]);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

        <RHFTextField name="matemp" label="Matricule" />

        <RHFTextField
          name="password"
          label="Mot de passe"
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        <RHFCheckbox name="remember" label="Souvenez-vous de moi" />
        <NextLink href={PATH_AUTH.resetPassword} passHref>
          <Link variant="subtitle2">Mot de passe oublié ?</Link>
        </NextLink>
      </Stack>

      <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
        Se connecter
      </LoadingButton>
    </FormProvider>
  );
}
