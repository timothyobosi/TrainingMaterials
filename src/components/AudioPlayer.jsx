import React, { useEffect, useRef, useState } from 'react'
import './AudioPlayer.css'
import { FaPause, FaPlay, FaRedo } from 'react-icons/fa';

const AudioPlayer = ({ src, onEnded, onRestart, isPlaying, onPlayPause }) => {
  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Handle play/pause toggle
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((error) => console.log('Play failed:', error));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Handle audio events (ended, metadata loaded)
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => {
        const playedSeconds = Math.floor(audio.duration || 0);
        onEnded(playedSeconds); // Pass duration to parent
      };

      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
      };

      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [onEnded]);

  // Update progress while playing
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateProgress = () => setProgress(audio.currentTime);
      audio.addEventListener('timeupdate', updateProgress);
      return () => audio.removeEventListener('timeupdate', updateProgress);
    }
  }, []);

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      onRestart();
      audioRef.current.play().catch((error) => console.log('Play failed:', error));
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      onPlayPause(!isPlaying);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={src} preload="auto" />
      
      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${(progress / (audioRef.current?.duration || 1)) * 100}%`
            }}
          />
        </div>
      </div>

      <div className="time-display">
        {formatTime(progress)} / {formatTime(duration)}
      </div>

      <div className="controls">
        <div className="control-item">
          <button onClick={handlePlayPause}>
            {isPlaying ? <FaPause size={28} /> : <FaPlay size={28} />}
          </button>
          <span>{isPlaying ? "Pause" : "Play"}</span>
        </div>

        <div className="control-item">
          <button onClick={handleRestart}>
            <FaRedo size={28} />
          </button>
          <span>Restart</span>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
