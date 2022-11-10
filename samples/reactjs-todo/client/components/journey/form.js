/*
 * forgerock-sample-web-react
 *
 * form.js
 *
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { FRAuth, TokenManager, UserManager } from '@forgerock/javascript-sdk';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppContext } from '../../global-state';

import Loading from '../utilities/loading';
import Alert from './alert';
import Password from './password';
import Text from './text';
import Unknown from './unknown';

/**
 * @function Form - React component for managing the user authentication journey
 * @returns {Object} - React component object
 */
export default function Form() {
  const [step, setStep] = useState(null);
  const [isAuthenticated, setAuthentication] = useState(false);
  const [_, methods] = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    const getStep = async () => {
      try {
        const initStep = await FRAuth.start();
        console.log(initStep);
        setStep(initStep);
      } catch (err) {
        console.error(`Error: request for initial step; ${err}`);
      }
    };
    getStep();
    const oauthFlow = async () => {
      try {
        const tokens = await TokenManager.getTokens();
        console.log(tokens);
        const user = await UserManager.getCurrentUser();
        console.log(user);

        methods.setUser(user.name);
        methods.setEmail(user.email);
        methods.setAuthentication(true);

        navigate('/');
      } catch (err) {
        console.log(`Error: token request; ${err}`);
      }
    };
    if (isAuthenticated) {
      oauthFlow();
    }
  }, [isAuthenticated, methods, navigate]);

  const mapCallbacksToComponents = (cb, idx) => {
    const name = cb?.payload?.input?.[0].name;
    switch (cb.getType()) {
      case 'NameCallback':
        return <Text callback={cb} inputName={name} key="username" />;
      case 'PasswordCallback':
        return <Password callback={cb} inputName={name} key="password" />;
      default:
        // If current callback is not supported, render a warning message
        return <Unknown callback={cb} key={`unknown-${idx}`} />;
    }
  };

  if (!step) {
    return <Loading message="Checking your session ..." />;
  } else if (step.type === 'LoginSuccess') {
    return <Alert message="Success! You're logged in." type="success" />;
  } else if (step.type === 'Step') {
    return (
      <form
        className="cstm_form"
        onSubmit={(e) => {
          e.preventDefault();
          const getStep = async () => {
            try {
              let nextStep = await FRAuth.next(step);
              if (nextStep.type === 'LoginSuccess') {
                setAuthentication(true);
              }
              console.log(nextStep);
              setStep(nextStep);
            } catch (err) {
              console.error(`Error: form submission; ${err}`);
            }
          };
          getStep();
        }}
      >
        {step.callbacks.map(mapCallbacksToComponents)}
        <button className="btn btn-primary w-100" type="submit">
          Sign In
        </button>
      </form>
    );
  } else {
    return <Alert message={step.payload.message} />;
  }
}
