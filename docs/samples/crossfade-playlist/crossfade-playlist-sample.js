/*
 * Copyright 2013 Boris Smus. All Rights Reserved.

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var CrossfadePlaylistSample = function () {
  // This function works as a constructor when called with 'new'
  this.FADE_TIME = 1; // Seconds
  this.isPlaying = false;
  loadSounds(this, {
    jam: 'jam.wav',
    crowd: 'crowd.wav',
  });
};

CrossfadePlaylistSample.prototype.play = function () {
  var ctx = this;
  playHelper([this.jam, this.crowd], 4, 1);

  function createSource(buffer) {
    // Creates bufferSource and gainNode instance from context
    var source = context.createBufferSource();
    var gainNode = context.createGain();
    // Set the passed buffer as the buffer source.
    source.buffer = buffer;
    // Connect source to gain.
    source.connect(gainNode);
    // Connect gain to destination.
    gainNode.connect(context.destination);

    // Return the connected bufferSource and gainNode
    return {
      source: source,
      gainNode: gainNode,
    };
  }

  /**
   * Plays back a playlist of buffers, automatically crossfading between them.
   * Iterations specifies the number of times to play through the playlist.
   */
  function playHelper(buffers, iterations, fadeTime) {
    // Get the absolute time from context
    var currTime = context.currentTime;
    // For the given iterations,
    for (var i = 0; i < iterations; i++) {
      // For each buffer, schedule its playback in the future using buffer duration and current context time.
      for (var j = 0; j < buffers.length; j++) {
        var buffer = buffers[j];
        var duration = buffer.duration;
        var info = createSource(buffer);
        var source = info.source;
        var gainNode = info.gainNode;

        // Schedule fade in and out of each audio file for each iteration.
        // Fade it in.
        gainNode.gain.linearRampToValueAtTime(0, currTime); // by currTime, ramp to 0
        gainNode.gain.linearRampToValueAtTime(1, currTime + fadeTime); // ramp to 1 over fadeTime
        // Then fade it out.
        gainNode.gain.linearRampToValueAtTime(
          1,
          currTime + duration - fadeTime
        ); // start from 1 at the duration - fadeTime
        // then ramp it down to 0 by the end of duration.
        gainNode.gain.linearRampToValueAtTime(0, currTime + duration);

        // Play the track now.
        source[source.start ? 'start' : 'noteOn'](currTime);

        // Increment time for the next iteration.
        currTime += duration - fadeTime;
      }
    }
  }
};
