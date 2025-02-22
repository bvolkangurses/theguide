
import React from 'react';

const Book1 = () => (
  <div className="book-container">
    <h1 className='h1'>The Feynman Lectures On Physics</h1>
    <div className="book-content narrow-text scrollable">
      <div id="Ch1-S1-p1" className="para">
        <p className="p">This two-year course in physics is presented from the point
        of view that you, the reader, are going to be a physicist. This is not
        necessarily the case of course, but that is what every professor in
        every subject assumes! If you are going to be a physicist, you will have
        a lot to study: two hundred years of the most rapidly developing field
        of knowledge that there is. So much knowledge, in fact, that you might
        think that you cannot learn all of it in four years, and truly you
        cannot; you will have to go to graduate school too!</p>
      </div>
      <div id="Ch1-S1-p2" className="para">
        <p className="p">Surprisingly enough, in spite of the tremendous amount of work that has
        been done for all this time it is possible to condense the enormous mass
        of results to a large extent—that is, to find <em className="emph">laws</em> which
        summarize all our knowledge. Even so, the laws are so hard to grasp that
        it is unfair to you to start exploring this tremendous subject without
        some kind of map or outline of the relationship of one part of the
        subject of science to another. Following these preliminary remarks, the
        first three chapters will therefore outline the relation of physics to
        the rest of the sciences, the relations of the sciences to each other,
        and the meaning of science, to help us develop a “feel” for the
        subject.</p>
      </div>
      <div id="Ch1-S1-p3" className="para">
        <p className="p">You might ask why we cannot teach physics by just giving the basic laws
        on page one and then showing how they work in all possible
        circumstances, as we do in Euclidean geometry, where we state
        the axioms and then make all sorts of deductions. (So, not satisfied to
        learn physics in four years, you want to learn it in four minutes?) We
        cannot do it in this way for two reasons. First, we do not yet
        <em className="emph">know</em> all the basic laws: there is an expanding frontier of
        ignorance. Second, the correct statement of the laws of physics involves
        some very unfamiliar ideas which require advanced mathematics for their
        description. Therefore, one needs a considerable amount of preparatory
        training even to learn what the <em className="emph">words</em> mean. No, it is not
        possible to do it that way. We can only do it piece by piece.</p>
      </div>
      <div id="Ch1-S1-p4" className="para">
        <p className="p">Each piece, or part, of the whole of nature is always merely an
        <em className="emph">approximation</em> to the complete truth, or the complete truth so far
        as we know it. In fact, everything we know is only some kind of
        approximation, because <em className="emph">we know that we do not know all the laws</em>
        as yet. Therefore, things must be learned only to be unlearned again or,
        more likely, to be corrected.</p>
      </div>
      <div id="Ch1-S1-p5" className="para">
        <p className="p">The principle of science, the definition, almost, is the following:
        <em className="emph">The test of all knowledge is experiment</em>. Experiment is the
        <em className="emph">sole judge</em> of scientific “truth.” But what is the source of
        knowledge? Where do the laws that are to be tested come from?
        Experiment, itself, helps to produce these laws, in the sense that it
        gives us hints. But also needed is <em className="emph">imagination</em> to create from
        these hints the great generalizations—to guess at the wonderful,
        simple, but very strange patterns beneath them all, and then to
        experiment to check again whether we have made the right guess. This
        imagining process is so difficult that there is a division of labor in
        physics: there are <em className="emph">theoretical</em> physicists who imagine, deduce,
        and guess at new laws, but do not experiment; and then there are
        <em className="emph">experimental</em> physicists who experiment, imagine, deduce, and
        guess.</p>
      </div>
    </div>
  </div>
);

export default Book1;