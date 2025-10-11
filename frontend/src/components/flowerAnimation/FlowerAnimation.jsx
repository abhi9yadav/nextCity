import React, { useState, useEffect } from 'react';
import './flowerAnimation.css';

const FlowerAnimation = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`bodi w-full h-full absolute ${!isLoaded ? 'not-loaded' : ''}`}>
      <div className="night"></div>
      <div className="flowers">
        <div className="flower flower--1">
          <div className="flower__leafs flower__leafs--1">
            <div className="flower__leaf flower__leaf--1"></div>
            <div className="flower__leaf flower__leaf--2"></div>
            <div className="flower__leaf flower__leaf--3"></div>
            <div className="flower__leaf flower__leaf--4"></div>
            <div className="flower__white-circle"></div>

            <div className="flower__light flower__light--1"></div>
            <div className="flower__light flower__light--2"></div>
            <div className="flower__light flower__light--3"></div>
            <div className="flower__light flower__light--4"></div>
            <div className="flower__light flower__light--5"></div>
            <div className="flower__light flower__light--6"></div>
            <div className="flower__light flower__light--7"></div>
            <div className="flower__light flower__light--8"></div>
          </div>
          <div className="flower__line">
            <div className="flower__line__leaf flower__line__leaf--1"></div>
            <div className="flower__line__leaf flower__line__leaf--2"></div>
            <div className="flower__line__leaf flower__line__leaf--3"></div>
            <div className="flower__line__leaf flower__line__leaf--4"></div>
            <div className="flower__line__leaf flower__line__leaf--5"></div>
            <div className="flower__line__leaf flower__line__leaf--6"></div>
          </div>
        </div>

        <div className="flower flower--2">
          <div className="flower__leafs flower__leafs--2">
            <div className="flower__leaf flower__leaf--1"></div>
            <div className="flower__leaf flower__leaf--2"></div>
            <div className="flower__leaf flower__leaf--3"></div>
            <div className="flower__leaf flower__leaf--4"></div>
            <div className="flower__white-circle"></div>

            <div className="flower__light flower__light--1"></div>
            <div className="flower__light flower__light--2"></div>
            <div className="flower__light flower__light--3"></div>
            <div className="flower__light flower__light--4"></div>
            <div className="flower__light flower__light--5"></div>
            <div className="flower__light flower__light--6"></div>
            <div className="flower__light flower__light--7"></div>
            <div className="flower__light flower__light--8"></div>
          </div>
          <div className="flower__line">
            <div className="flower__line__leaf flower__line__leaf--1"></div>
            <div className="flower__line__leaf flower__line__leaf--2"></div>
            <div className="flower__line__leaf flower__line__leaf--3"></div>
            <div className="flower__line__leaf flower__line__leaf--4"></div>
          </div>
        </div>

        <div className="flower flower--3">
          <div className="flower__leafs flower__leafs--3">
            <div className="flower__leaf flower__leaf--1"></div>
            <div className="flower__leaf flower__leaf--2"></div>
            <div className="flower__leaf flower__leaf--3"></div>
            <div className="flower__leaf flower__leaf--4"></div>
            <div className="flower__white-circle"></div>

            <div className="flower__light flower__light--1"></div>
            <div className="flower__light flower__light--2"></div>
            <div className="flower__light flower__light--3"></div>
            <div className="flower__light flower__light--4"></div>
            <div className="flower__light flower__light--5"></div>
            <div className="flower__light flower__light--6"></div>
            <div className="flower__light flower__light--7"></div>
            <div className="flower__light flower__light--8"></div>
          </div>
          <div className="flower__line">
            <div className="flower__line__leaf flower__line__leaf--1"></div>
            <div className="flower__line__leaf flower__line__leaf--2"></div>
            <div className="flower__line__leaf flower__line__leaf--3"></div>
            <div className="flower__line__leaf flower__line__leaf--4"></div>
          </div>
        </div>

        <div className="grow-ans" style={{'--d':'1.2s'}}>
          <div className="flower__g-long">
            <div className="flower__g-long__top"></div>
            <div className="flower__g-long__bottom"></div>
          </div>
        </div>

        <div className="growing-grass">
          <div className="flower__grass flower__grass--1">
            <div className="flower__grass--top"></div>
            <div className="flower__grass--bottom"></div>
            <div className="flower__grass__leaf flower__grass__leaf--1"></div>
            <div className="flower__grass__leaf flower__grass__leaf--2"></div>
            <div className="flower__grass__leaf flower__grass__leaf--3"></div>
            <div className="flower__grass__leaf flower__grass__leaf--4"></div>
            <div className="flower__grass__leaf flower__grass__leaf--5"></div>
            <div className="flower__grass__leaf flower__grass__leaf--6"></div>
            <div className="flower__grass__leaf flower__grass__leaf--7"></div>
            <div className="flower__grass__leaf flower__grass__leaf--8"></div>
            <div className="flower__grass__overlay"></div>
          </div>
        </div>

        <div className="growing-grass">
          <div className="flower__grass flower__grass--2">
            <div className="flower__grass--top"></div>
            <div className="flower__grass--bottom"></div>
            <div className="flower__grass__leaf flower__grass__leaf--1"></div>
            <div className="flower__grass__leaf flower__grass__leaf--2"></div>
            <div className="flower__grass__leaf flower__grass__leaf--3"></div>
            <div className="flower__grass__leaf flower__grass__leaf--4"></div>
            <div className="flower__grass__leaf flower__grass__leaf--5"></div>
            <div className="flower__grass__leaf flower__grass__leaf--6"></div>
            <div className="flower__grass__leaf flower__grass__leaf--7"></div>
            <div className="flower__grass__leaf flower__grass__leaf--8"></div>
            <div className="flower__grass__overlay"></div>
          </div>
        </div>

        <div className="grow-ans" style={{'--d':'2.4s'}}>
          <div className="flower__g-right flower__g-right--1">
            <div className="leaf"></div>
          </div>
        </div>

        <div className="grow-ans" style={{'--d':'2.8s'}}>
          <div className="flower__g-right flower__g-right--2">
            <div className="leaf"></div>
          </div>
        </div>

        <div className="grow-ans" style={{'--d':'2.8s'}}>
          <div className="flower__g-front">
            <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--1">
              <div className="flower__g-front__leaf"></div>
            </div>
            <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--2">
              <div className="flower__g-front__leaf"></div>
            </div>
            <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--3">
              <div className="flower__g-front__leaf"></div>
            </div>
            <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--4">
              <div className="flower__g-front__leaf"></div>
            </div>
            <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--5">
              <div className="flower__g-front__leaf"></div>
            </div>
            <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--6">
              <div className="flower__g-front__leaf"></div>
            </div>
            <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--7">
              <div className="flower__g-front__leaf"></div>
            </div>
            <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--8">
              <div className="flower__g-front__leaf"></div>
            </div>
            <div className="flower__g-front__line"></div>
          </div>
        </div>

        <div className="grow-ans" style={{'--d':'3.2s'}}>
          <div className="flower__g-fr">
            <div className="leaf"></div>
            <div className="flower__g-fr__leaf flower__g-fr__leaf--1"></div>
            <div className="flower__g-fr__leaf flower__g-fr__leaf--2"></div>
            <div className="flower__g-fr__leaf flower__g-fr__leaf--3"></div>
            <div className="flower__g-fr__leaf flower__g-fr__leaf--4"></div>
            <div className="flower__g-fr__leaf flower__g-fr__leaf--5"></div>
            <div className="flower__g-fr__leaf flower__g-fr__leaf--6"></div>
            <div className="flower__g-fr__leaf flower__g-fr__leaf--7"></div>
            <div className="flower__g-fr__leaf flower__g-fr__leaf--8"></div>
          </div>
        </div>

        <div className="long-g long-g--0">
            <div className="grow-ans" style={{'--d':'3s'}}>
                <div className="leaf leaf--0"></div>
            </div>
            <div className="grow-ans" style={{'--d':'2.2s'}}>
                <div className="leaf leaf--1"></div>
            </div>
            <div className="grow-ans" style={{'--d':'3.4s'}}>
                <div className="leaf leaf--2"></div>
            </div>
            <div className="grow-ans" style={{'--d':'3.6s'}}>
                <div className="leaf leaf--3"></div>
            </div>
        </div>

        <div className="long-g long-g--1">
            <div className="grow-ans" style={{'--d':'3.6s'}}>
                <div className="leaf leaf--0"></div>
            </div>
            <div className="grow-ans" style={{'--d':'3.8s'}}>
                <div className="leaf leaf--1"></div>
            </div>
            <div className="grow-ans" style={{'--d':'4s'}}>
                <div className="leaf leaf--2"></div>
            </div>
            <div className="grow-ans" style={{'--d':'4.2s'}}>
                <div className="leaf leaf--3"></div>
            </div>
        </div>

        <div className="long-g long-g--2">
            <div className="grow-ans" style={{'--d':'4s'}}>
                <div className="leaf leaf--0"></div>
            </div>
            <div className="grow-ans" style={{'--d':'4.2s'}}>
                <div className="leaf leaf--1"></div>
            </div>
            <div className="grow-ans" style={{'--d':'4.4s'}}>
                <div className="leaf leaf--2"></div>
            </div>
            <div className="grow-ans" style={{'--d':'4.6s'}}>
                <div className="leaf leaf--3"></div>
            </div>
        </div>

        <div className="long-g long-g--3">
            <div className="grow-ans" style={{'--d':'4s'}}>
                <div className="leaf leaf--0"></div>
            </div>
            <div className="grow-ans" style={{'--d':'4.2s'}}>
                <div className="leaf leaf--1"></div>
            </div>
            <div className="grow-ans" style={{'--d':'3s'}}>
                <div className="leaf leaf--2"></div>
            </div>
            <div className="grow-ans" style={{'--d':'3.6s'}}>
                <div className="leaf leaf--3"></div>
            </div>
        </div>

        <div className="long-g long-g--4">
            <div className="grow-ans" style={{'--d':'4s'}}>
                <div className="leaf leaf--0"></div>
            </div>
            <div className="grow-ans" style={{'--d':'4.2s'}}>
                <div className="leaf leaf--1"></div>
            </div>
            <div className="grow-ans" style={{'--d':'3s'}}>
                <div className="leaf leaf--2"></div>
            </div>
            <div className="grow-ans" style={{'--d':'3.6s'}}>
                <div className="leaf leaf--3"></div>
            </div>
        </div>

        <div className="long-g long-g--5">
            <div className="grow-ans" style={{'--d':'4s'}}>
                <div className="leaf leaf--0"></div>
            </div>
            <div className="grow-ans" style={{'--d':'4.2s'}}>
                <div className="leaf leaf--1"></div>
            </div>
            <div className="grow-ans" style={{'--d':'3s'}}>
                <div className="leaf leaf--2"></div>
            </div>
            <div className="grow-ans" style={{'--d':'3.6s'}}>
                <div className="leaf leaf--3"></div>
            </div>
        </div>

        <div className="long-g long-g--6">
            <div className="grow-ans" style={{'--d':'4.2s'}}>
                <div className="leaf leaf--0"></div>
            </div>
            <div className="grow-ans" style={{'--d':'4.4s'}}>
                <div className="leaf leaf--1"></div>
            </div>
            <div className="grow-ans" style={{'--d':'4.6s'}}>
                <div className="leaf leaf--2"></div>
            </div>
            <div className="grow-ans" style={{'--d':'4.8s'}}>
                <div className="leaf leaf--3"></div>
            </div>
        </div>

        <div className="long-g long-g--7">
            <div className="grow-ans" style={{'--d':'3s'}}>
                <div className="leaf leaf--0"></div>
            </div>
            <div className="grow-ans" style={{'--d':'3.2s'}}>
                <div className="leaf leaf--1"></div>
            </div>
            <div className="grow-ans" style={{'--d':'3.5s'}}>
                <div className="leaf leaf--2"></div>
            </div>
            <div className="grow-ans" style={{'--d':'3.6s'}}>
                <div className="leaf leaf--3"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FlowerAnimation;