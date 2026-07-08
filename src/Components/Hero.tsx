import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Chessboard, type PieceDropHandlerArgs } from "react-chessboard";
import { Chess } from "chess.js";
import { motion, useAnimation, useMotionValue } from "framer-motion";
import confetti from "canvas-confetti";
import logo from "../assets/xlchess.png";
import chess_icon from "../assets/chess_icon.png";

import "../App.css";
import {
  firstMoves,
  lastFourBlackMoves,
  lastFourWhiteMoves,
} from "../utils/moves";

const files = "abcdefgh";

export const Hero = () => {
  const game = useRef(new Chess());
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(game.current.fen());

  const [autoplay, setAutoplay] = useState<boolean>(true);

  const [squareStyles, setSquareStyles] = useState<
    Record<string, React.CSSProperties>
  >({});
  const [hover, setHover] = useState<boolean>(false);
  const [reset, setReset] = useState<boolean>(false);

  const [movesCount, setMovesCount] = useState<number>(0);
  const [checkMate, setCheckmate] = useState<boolean>(false);

  const [isInvalid, setIsInvalid] = useState<boolean>(false);

  const controls = useAnimation();

  const mouse = {
    x: useMotionValue(0),
    y: useMotionValue(0),
  };

  const getCheckedKingSquare = () => {
    const color = game.current.turn(); // "w" or "b"

    const board = game.current.board();

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];

        if (piece?.type === "k" && piece.color === color) {
          return `${files[col]}${8 - row}`;
        }
      }
    }

    return null;
  };

  //   Piece Drop animations

  const PieceDropAnimation = ({
    sourceSquare,
    targetSquare,
  }: PieceDropHandlerArgs) => {
    if (typeof targetSquare !== "string") return false;

    const move = game.current.move({ from: sourceSquare, to: targetSquare });
    if (move) {
      setSquareStyles({
        [sourceSquare]: {
          backgroundColor: "#FFFF0066",
        },
        [targetSquare]: {
          backgroundColor: "#FFFF0066",
        },
      });
      setPosition(game.current.fen());

      if (game.current.isCheck()) {
        setSquareStyles({
          ...squareStyles,
          [getCheckedKingSquare()!]: {
            animation: "blinkRed 0.5s ease-in-out",
          },
        });
      }
    }
  };

  const onPieceDrop = ({
    sourceSquare,
    targetSquare,
  }: PieceDropHandlerArgs) => {
    if (autoplay) return false;

    const expected = lastFourWhiteMoves[movesCount];

    if (sourceSquare !== expected.from || targetSquare !== expected.to) {
      setIsInvalid(true);
      return false;
    }

    // Play user's move
    const move = game.current.move({
      from: sourceSquare,
      to: targetSquare,
    });

    if (!move) return false;

    setSquareStyles({
      [sourceSquare]: {
        backgroundColor: "#FFFF0066",
      },
      [targetSquare as string]: {
        backgroundColor: "#FFFF0066",
      },
    });

    setPosition(game.current.fen());

    const currentMove = movesCount;
    setMovesCount((p) => p + 1);
    setIsInvalid(false);

    if (game.current.isCheckmate()) {
      setCheckmate(true);
      return true;
    }

    if (game.current.isCheck()) {
      setSquareStyles((prev) => ({
        ...prev,
        [getCheckedKingSquare()!]: {
          animation: "blinkRed 0.5s ease-in-out",
        },
      }));
    }

    // Auto-play Black
    const blackMove = lastFourBlackMoves[currentMove];

    if (blackMove) {
      setTimeout(() => {
        const black = game.current.move(blackMove);

        if (!black) return;

        setSquareStyles({
          [black.from]: {
            backgroundColor: "#FFFF0066",
          },
          [black.to]: {
            backgroundColor: "#FFFF0066",
          },
        });

        setPosition(game.current.fen());

        if (game.current.isCheckmate()) {
          alert("Black wins by checkmate!");
        } else if (game.current.isCheck()) {
          setSquareStyles((prev) => ({
            ...prev,
            [getCheckedKingSquare()!]: {
              animation: "blinkRed 0.5s ease-in-out",
            },
          }));
        }
      }, 500);
    }

    return true;
  };

  const chessboardOptions = {
    lightSquareStyle: {
      backgroundColor: "#eeeed2",
    },
    darkSquareStyle: {
      backgroundColor: "#769656",
    },
    boardStyle: {
      borderRadius: "3px",
    },
    lightSquareNotationStyle: {
      color: "#acac97",
      fontWeight: 700,
      textShadow: `
    1px 1px 2px rgba(0,0,0,0.35),
    -1px -1px 2px rgba(255,255,255,0.45)
  `,
    },

    darkSquareNotationStyle: {
      color: "#5b762f",
      fontWeight: 700,
      textShadow: `
    1px 1px 2px rgba(0,0,0,0.35),
    -1px -1px 2px rgba(255,255,255,0.45)
  `,
    },
    position,
    animationDuration: 100,
    onPieceDrop,
    // customSquareStyles: highlightedSquares,
    squareStyles,
  };

  //   Handler functions

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    mouse.x.set(e.clientX - rect.x);
    mouse.y.set(e.clientY - rect.y);
  };

  const handleHoverStart = async () => {
    await controls.set({ x: -40 }); // this is for reset to start
    controls.start({
      x: 200,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    });
  };

  const handleSideCanons = () => {
    const end = Date.now() + 3 * 1000;
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];
    const frame = () => {
      if (Date.now() > end) return;
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });
      requestAnimationFrame(frame);
    };
    frame();
  };

  useEffect(() => {
    (async () => {
      if (reset) {
        game.current.reset();
        setPosition(game.current.fen());
        await new Promise((r) => setTimeout(r, 1000));
      }
      for (const move of firstMoves) {
        PieceDropAnimation({
          sourceSquare: move.from,
          targetSquare: move.to,
        } as PieceDropHandlerArgs);

        setPosition(game.current.fen());

        await new Promise((r) => setTimeout(r, 900));
      }
      setAutoplay(false);
      setReset(false);
    })();
  }, [reset]);

  useEffect(() => {
    if (checkMate) {
      setTimeout(() => {}, 1000);
      handleSideCanons();
    }
  }, [checkMate]);

  return (
    <main className="z-10 bg-linear-to-r from-white/5 via-blue-950/5 to-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 items-center justify-center py-15 md:pt-24 md:pb-28 gap-12 text-white">
          {/* Header section */}

          <header className="col-span-6 text-left space-y-6">
            {/* LOGO */}

            <div>
              <motion.img
                initial={{
                  y: -30,
                  opacity: 0,
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                }}
                transition={{
                  ease: "linear",
                  duration: 0.5,
                }}
                src={logo}
                alt="XLChess logo"
                className="h-40 w-auto"
                draggable={false}
              />
            </div>
            <h1 className="font-extrabold text-4xl sm:text-5xl md:text-6xl flex flex-col gap-1 font-inter mt-8">
              <div className="flex flex-wrap gap-3">
                {["Build", "the", "Future", "of"].map((w, i) => (
                  <motion.span
                    key={i}
                    custom={i}
                    initial={{ y: 15, opacity: 0 }}
                    animate={{
                      y: 0,
                      opacity: 1,
                      transition: {
                        duration: 0.4,
                        delay: i * 0.15,
                      },
                    }}
                    transition={{
                      duration: 1,
                    }}
                  >
                    {w}
                  </motion.span>
                ))}
              </div>
              <motion.div
                // className="inline-block text-transparent bg-clip-text"
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.4,
                  delay: 0.5,
                }}
                className="mt-2 bg-gradient-to-r from-[#6366f1] via-[#818cf8] to-[#a78bfa] bg-clip-text text-transparent"
              >
                Online Chess
              </motion.div>
            </h1>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white/90 font-sans">
                Making the Best Move on the Way to the Top
              </h2>
              <div className="text-white/60 mt-2 flex flex-wrap gap-1">
                {[
                  "A",
                  "complete",
                  "chess",
                  "platform",
                  "to",
                  "play,",
                  "learn,",
                  "compete,",
                  "and",
                  "grow",
                  "built",
                  "to",
                  "become",
                  "the",
                  "world's",
                  "#1",
                  "destination",
                  "for",
                  "chess",
                ].map((w, i) => (
                  <motion.span
                    key={i}
                    initial={{
                      y: 5,
                      opacity: 0,
                      filter: "blur(10px)",
                    }}
                    animate={{
                      y: 0,
                      opacity: 1,
                      filter: "blur(0px)",
                      transition: {
                        delay: i * 0.05,
                      },
                    }}
                    transition={{
                      delay: 1,
                      duration: 1,
                    }}
                  >
                    {w}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Play button */}
            <motion.div
              ref={containerRef}
              className="relative inline-block overflow-hidden rounded-md"
              onMouseMove={handleMouseMove}
              onHoverStart={() => {
                setHover(true);
                handleHoverStart();
              }}
              onHoverEnd={() => setHover(false)}
              onClick={() => {
                alert("Feature Not available yet");
              }}
              initial={{
                opacity: 0,
                scale: 0.8,
                x: 20,
                y: 20,
                filter: "blur(5px)",
              }}
              animate={{
                opacity: 1,
                scale: 1,
                x: 0,
                y: 0,
                filter: "blur(0px)",
              }}
              transition={{
                delay: 0.7,
                duration: 1,
                ease: "backIn",
              }}
            >
              {/* Slide animation */}
              <motion.div
                animate={controls}
                className="absolute -left-7 top-1/2 -translate-y-1/2 w-3 h-50 bg-white origin-center rotate-15 blur-sm"
              />
              <button className="bg-[#6669F2] px-5 flex items-center gap-2 overflow-hidden rounded-md cursor-grab">
                <img
                  src={chess_icon}
                  alt="chess icon"
                  className={`size-16 ${!hover ? "opacity-100" : "opacity-0"}`}
                />

                {hover && (
                  <motion.img
                    src={chess_icon}
                    alt="Chess"
                    style={{
                      x: mouse.x,
                      y: mouse.y,
                    }}
                    className="absolute w-16 h-16 -translate-x-14 -translate-y-1/2 pointer-events-none"
                  />
                )}
                <span className="font-semibold text-[17px] flex gap-0.3 overflow-hidden">
                  {["P", "l", "a", "y"].map((v, i) => (
                    <motion.span
                      className="inline-block"
                      initial={{ y: 0 }}
                      animate={{
                        y: hover ? "-100%" : 0,
                        // filter: hover ? "blur(1px)" : "blur(0px)",
                      }}
                      transition={{
                        duration: 0.65,
                        ease: [0.22, 1, 0.36, 1],
                        delay: i * 0.05,
                      }}
                      key={i}
                    >
                      {v}
                    </motion.span>
                  ))}
                </span>
              </button>
            </motion.div>
          </header>

          {/* Chess board section  */}

          <section
            className={`col-span-6 flex justify-center ${autoplay ? "pointer-events-none" : "pointer-events-auto"}`}
          >
            <motion.div
              initial={{ x: 150, opacity: 0, rotate: -3, filter: "blur(15px)" }}
              animate={{
                x: 0,
                rotate: 0,
                opacity: [0, 0, 0, 0.5, 1],
                // opacity: [0, 0.1, 0.2, 0.5, 1],
                filter: "blur(0px)",
              }}
              transition={{ duration: 0.6, ease: "linear" }}
              className="flex flex-col gap-3 justify-center bg-blue-950 p-4 rounded-md border-[0.5px] border-white/20 w-full max-w-[440px] md:max-w-[480px] relative transition-all duration-300 hover:shadow-[0_0_100px_rgba(255,255,255,0.05)]"
            >
              {/* Checkmatee animation */}

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0,
                }}
                animate={
                  checkMate
                    ? {
                        opacity: 1,
                        scale: [
                          0, 0.5, 0.7, 1, 1.15, 1, 1, 1, 1, 1, 1, 1, 0.8, 0.5,
                          0,
                        ],
                      }
                    : {
                        opacity: 0,
                        scale: 0,
                      }
                }
                transition={{
                  duration: 3,
                  ease: "easeInOut",
                }}
                className="z-40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-500/90 rounded-full text-white w-60 h-30 p-2 text-3xl flex justify-center items-center font-bold"
              >
                Checkmate
              </motion.div>

              {/* Main chess board */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.8,
                  duration: 0.3,
                  ease: "linear",
                }}
                className={`${checkMate ? "pointer-events-none" : "pointer-events-auto"}`}
              >
                <Chessboard options={chessboardOptions} />
              </motion.div>

              {/* Chess description */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs uppercase font-semibold text-white/50">
                    {autoplay
                      ? "The Evergreen game"
                      : checkMate
                        ? "Brilliant."
                        : "Can you finish the Evergreen Game?"}
                  </p>
                  <h3 className="font-semibold text-sm">
                    {autoplay || checkMate
                      ? "Anderssen vs Dufresne, 1852"
                      : "White to move."}
                  </h3>
                  {isInvalid && (
                    <p className="text-red-500 animate-pulse text-xs">
                      incorrect move try again..
                    </p>
                  )}
                </div>
                <div className="flex flex-col justify-center px-4 py-1 border-[0.5px] border-red-500/30 rounded-lg items-center p-2 bg-[#152054]">
                  <span className="font-bold text-xl text-[#6366F1]">
                    {4 - movesCount}
                  </span>
                  <span className="text-[9px] mt-[0.5px] text-white/30">
                    MOVES LEFT
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div>
                {autoplay ? (
                  <button
                    disabled={autoplay}
                    className="border-[0.3px] border-white/20 rounded-md text-center w-full py-2 text-white/20 bg-[#152054] font-semibold flex justify-center items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgb(99 102 241)"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="lucide lucide-play w-4 h-4 text-brand-accent animate-pulse mr-2"
                      aria-hidden="true"
                    >
                      <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"></path>
                    </svg>
                    Autoplay in Progress...
                  </button>
                ) : (
                  <div
                    className={!checkMate ? `flex justify-between gap-4` : ""}
                  >
                    {!checkMate && (
                      <button
                        onClick={() => {
                          game.current.load(
                            "1r2k1r1/pbppnp1p/1b3P2/8/Q7/B1PB1q2/P4PPP/3R2K1 w - - 0 21",
                          );

                          setPosition(game.current.fen());
                          setMovesCount(0);
                        }}
                        className="border-[0.3px] border-white/20 rounded-md text-center w-full py-2 text-white/80 bg-[#152054] font-semibold flex justify-center items-center gap-2 cursor-pointer hover:bg-white/10"
                      >
                        <SVGReload />
                        <span>Reset Puzzle</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setAutoplay(true);
                        setReset(true);
                        setCheckmate(false);
                        setMovesCount(0);
                      }}
                      className={`border-[0.3px] border-white/20 rounded-md text-center w-full py-2 text-white/80  font-semibold flex justify-center items-center gap-2 cursor-pointer hover:bg-white/10 ${checkMate ? "bg-blue-600" : "bg-[#152054]"}`}
                    >
                      <SVGReload classNames={checkMate ? `stroke-white` : ""} />
                      <span>
                        Replay{" "}
                        {!checkMate && <span className="ml-1">Full game</span>}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </section>
        </div>
      </div>
    </main>
  );
};

const SVGReload = ({ classNames }: { classNames?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6366f1"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className={`lucide lucide-rotate-ccw w-4 h-4 text-brand-accent ${classNames}`}
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
      <path d="M3 3v5h5"></path>
    </svg>
  );
};
