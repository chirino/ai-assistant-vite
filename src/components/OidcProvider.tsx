import React, { Suspense } from "react";

import { AuthProvider, useAuth } from "react-oidc-context";

import { initInterceptors } from "@src/axios-config";
import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
} from "@patternfly/react-core";

import { AppPlaceholder } from "./AppPlaceholder";
import { CubesIcon } from "@patternfly/react-icons";
import { oidcClientSettings } from "@src/libs/oidc.ts";
import ENV from "@src/libs/env.ts";

interface IOidcProviderProps {
  children: React.ReactNode;
}

export const OidcProvider: React.FC<IOidcProviderProps> = ({ children }) => {
  return ENV.AUTH_REQUIRED !== "true" ? (
    <>{children}</>
  ) : (
    <AuthProvider
      {...oidcClientSettings}
      automaticSilentRenew={true}
      onSigninCallback={() =>
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        )
      }
    >
      <AuthEnabledOidcProvider>{children}</AuthEnabledOidcProvider>
    </AuthProvider>
  );
};

const AuthEnabledOidcProvider: React.FC<IOidcProviderProps> = ({
  children,
}) => {
  const auth = useAuth();

  React.useEffect(() => {
    if (!auth.isAuthenticated && !auth.isLoading && !auth.error) {
      auth.signinRedirect();
    }
  }, [auth]);

  React.useEffect(() => {
    initInterceptors();
  }, []);

  if (auth.isAuthenticated) {
    return <Suspense fallback={<AppPlaceholder />}>{children}</Suspense>;
  } else if (auth.isLoading) {
    return <AppPlaceholder />;
  } else if (auth.error) {
    return (
      <Bullseye>
        <EmptyState
          titleText="Auth Error"
          variant={EmptyStateVariant.sm}
          icon={CubesIcon}
        >
          <EmptyStateBody>
            {`${auth.error.name}: ${auth.error.message}`}. Revisit your OIDC
            configuration or contact your admin.
          </EmptyStateBody>
        </EmptyState>
      </Bullseye>
    );
  } else {
    return <p>Login in...</p>;
  }
};
