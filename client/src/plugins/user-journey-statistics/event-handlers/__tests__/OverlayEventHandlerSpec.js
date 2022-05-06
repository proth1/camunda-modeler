/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

/* global sinon */

import MixpanelHandler from '../../MixpanelHandler';
import OverlayEventHandler from '../OverlayEventHandler';

import emptyXML from './fixtures/empty.bpmn';
import emptyDMN from './fixtures/empty.dmn';

import engineProfileXML from './fixtures/engine-profile.bpmn';
import engineProfileDMN from './fixtures/engine-platform.dmn';


describe('<OverlayEventHandler>', () => {

  let subscribe, track;

  beforeEach(() => {

    subscribe = sinon.spy();

    track = sinon.spy();

    new OverlayEventHandler({
      track,
      subscribe
    });

    MixpanelHandler.getInstance().enable('token', 'id', 'stage');
  });


  describe('deploy overlay', () => {

    it('should subscribe to deployment.opened', () => {
      expect(subscribe.getCall(0).args[0]).to.eql('deployment.opened');
    });


    it('should subscribe to deployment.closed', () => {
      expect(subscribe.getCall(1).args[0]).to.eql('deployment.closed');
    });


    it('should send for type bpmn', async () => {

      // given
      const tab = createTab({
        type: 'bpmn'
      });

      const handleOverlayAction = subscribe.getCall(0).args[1];

      // when
      await handleOverlayAction({
        tab,
        context: 'deploymentTool'
      });

      // then
      expect(track).to.have.been.calledWith('overlay:deploy:opened', {
        diagramType: 'bpmn'
      });
    });


    it('should send for type cloud-bpmn', async () => {

      // given
      const tab = createTab({
        type: 'cloud-bpmn'
      });

      const handleOverlayAction = subscribe.getCall(0).args[1];

      // when
      await handleOverlayAction({
        tab,
        context: 'startInstance'
      });

      // then
      expect(track).to.have.been.calledWith('overlay:startInstance:opened', {
        diagramType: 'bpmn'
      });
    });


    it('should send for type dmn', async () => {

      // given
      const tab = createTab({
        type: 'dmn'
      });

      const handleOverlayAction = subscribe.getCall(0).args[1];

      // when
      await handleOverlayAction({
        tab,
        context: 'deploymentTool'
      });

      // then
      expect(track).to.have.been.calledWith('overlay:deploy:opened', {
        diagramType: 'dmn'
      });
    });


    it('should send for type cloud dmn', async () => {

      // given
      const tab = createTab({
        type: 'cloud-dmn'
      });

      const handleOverlayAction = subscribe.getCall(0).args[1];

      // when
      await handleOverlayAction({
        tab,
        context: 'startInstance'
      });

      // then
      expect(track).to.have.been.calledWith('overlay:startInstance:opened', {
        diagramType: 'dmn'
      });
    });


    describe('engine profile', () => {

      it('should send engine profile', async () => {

        // given
        const tab = createTab({
          type: 'bpmn',
          file: {
            contents: engineProfileXML
          }
        });

        const handleOverlayAction = subscribe.getCall(0).args[1];

        // when
        await handleOverlayAction({ tab });

        const { executionPlatform, executionPlatformVersion } = track.getCall(0).args[1];

        // then
        expect(executionPlatform).to.eql('Camunda Platform');
        expect(executionPlatformVersion).to.eql('7.15.0');

      });


      it('should send default engine profile', async () => {

        // given
        const tab = createTab({
          type: 'bpmn',
          file: {
            contents: emptyXML
          }
        });

        const handleOverlayAction = subscribe.getCall(0).args[1];

        // when
        await handleOverlayAction({ tab });

        const { executionPlatform } = track.getCall(0).args[1];

        // then
        expect(executionPlatform).to.eql('Camunda Platform');
      });


      it('should send default engine profile (cloud tabs)', async () => {

        // given
        const tab = createTab({
          type: 'cloud-bpmn',
          file: {
            contents: emptyXML
          }
        });

        const handleOverlayAction = subscribe.getCall(0).args[1];

        // when
        await handleOverlayAction({ tab });

        const { executionPlatform } = track.getCall(0).args[1];

        // then
        expect(executionPlatform).to.eql('Camunda Cloud');

      });


      describe('dmn', function() {

        it('should send engine profile', async () => {

          // given
          const tab = createTab({
            type: 'dmn',
            file: {
              contents: engineProfileDMN
            }
          });

          const handleOverlayAction = subscribe.getCall(0).args[1];

          // when
          await handleOverlayAction({ tab });

          const { executionPlatform, executionPlatformVersion } = track.getCall(0).args[1];

          // then
          expect(executionPlatform).to.eql('Camunda Platform');
          expect(executionPlatformVersion).to.eql('7.16.0');


        });


        it('should send default engine profile', async () => {

          // given
          const tab = createTab({
            type: 'dmn',
            file: {
              contents: emptyDMN
            }
          });

          const handleOverlayAction = subscribe.getCall(0).args[1];

          // when
          await handleOverlayAction({ tab });

          const { executionPlatform } = track.getCall(0).args[1];

          // then
          expect(executionPlatform).to.eql('Camunda Platform');
        });


        it('should send default engine profile (cloud tabs)', async () => {

          // given
          const tab = createTab({
            type: 'cloud-dmn',
            file: {
              contents: emptyDMN
            }
          });

          const handleOverlayAction = subscribe.getCall(0).args[1];

          // when
          await handleOverlayAction({ tab });

          const { executionPlatform } = track.getCall(0).args[1];

          // then
          expect(executionPlatform).to.eql('Camunda Cloud');
        });
      });

    });

  });


  describe('version info overlay', () => {

    it('should subscribe to versionInfo.opened', () => {
      expect(subscribe.getCall(2).args[0]).to.eql('versionInfo.opened');
    });

    it('should send source', async () => {

      // given
      const tab = createTab({
        type: 'bpmn'
      });

      const handleOverlayAction = subscribe.getCall(2).args[1];

      // when
      await handleOverlayAction({
        tab,
        source: 'foo'
      });

      // then
      expect(track).to.have.been.calledWith('overlay:versionInfo:opened', {
        source: 'foo'
      });
    });

  });

});


// helpers ///////////////

function createTab(overrides = {}) {
  return {
    id: 42,
    name: 'foo.bar',
    type: 'bar',
    title: 'foo',
    file: {
      name: 'foo.bar',
      contents: '',
      path: null
    },
    ...overrides
  };
}